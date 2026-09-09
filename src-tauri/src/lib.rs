use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

struct DbState(Mutex<Connection>);

fn db_path() -> PathBuf {
    let base = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    let dir = base.join("NebNotes");
    std::fs::create_dir_all(&dir).ok();
    dir.join("nebnotes.db")
}

fn init_schema(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT,
            icon TEXT DEFAULT 'fa-folder',
            expanded INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT DEFAULT '',
            folder_id TEXT,
            type TEXT DEFAULT 'text',
            icon TEXT DEFAULT 'fa-file-lines',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        "#,
    )?;
    Ok(())
}

fn load_all(conn: &Connection) -> Result<Value, String> {
    let mut folders = serde_json::Map::new();
    {
        let mut stmt = conn
            .prepare(
                "SELECT id, name, parent_id, icon, expanded, created_at, updated_at FROM folders",
            )
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok(json!({
                    "id": row.get::<_, String>(0)?,
                    "name": row.get::<_, String>(1)?,
                    "parentId": row.get::<_, Option<String>>(2)?,
                    "icon": row.get::<_, String>(3)?,
                    "expanded": row.get::<_, i64>(4)? != 0,
                    "createdAt": row.get::<_, String>(5)?,
                    "updatedAt": row.get::<_, String>(6)?,
                }))
            })
            .map_err(|e| e.to_string())?;
        for r in rows {
            let v = r.map_err(|e| e.to_string())?;
            let id = v["id"].as_str().unwrap().to_string();
            folders.insert(id, v);
        }
    }

    let mut notes = serde_json::Map::new();
    {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, folder_id, type, icon, created_at, updated_at FROM notes",
            )
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok(json!({
                    "id": row.get::<_, String>(0)?,
                    "title": row.get::<_, String>(1)?,
                    "content": row.get::<_, String>(2)?,
                    "folderId": row.get::<_, Option<String>>(3)?,
                    "type": row.get::<_, String>(4)?,
                    "icon": row.get::<_, String>(5)?,
                    "createdAt": row.get::<_, String>(6)?,
                    "updatedAt": row.get::<_, String>(7)?,
                }))
            })
            .map_err(|e| e.to_string())?;
        for r in rows {
            let v = r.map_err(|e| e.to_string())?;
            let id = v["id"].as_str().unwrap().to_string();
            notes.insert(id, v);
        }
    }

    let mut settings = json!({
        "theme": "light",
        "fontSize": 14,
        "previewDefault": false
    });
    {
        let mut stmt = conn
            .prepare("SELECT key, value FROM settings")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })
            .map_err(|e| e.to_string())?;
        if let Some(obj) = settings.as_object_mut() {
            for r in rows {
                let (k, v) = r.map_err(|e| e.to_string())?;
                if let Ok(parsed) = serde_json::from_str::<Value>(&v) {
                    obj.insert(k, parsed);
                } else {
                    obj.insert(k, Value::String(v));
                }
            }
        }
    }

    Ok(json!({
        "version": 1,
        "folders": folders,
        "notes": notes,
        "settings": settings
    }))
}

fn save_all(conn: &Connection, data: &Value) -> Result<(), String> {
    let tx = conn.unchecked_transaction().map_err(|e| e.to_string())?;

    tx.execute("DELETE FROM folders", []).map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM notes", []).map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM settings", []).map_err(|e| e.to_string())?;

    if let Some(folders) = data.get("folders").and_then(|v| v.as_object()) {
        for (_, f) in folders {
            tx.execute(
                "INSERT INTO folders (id, name, parent_id, icon, expanded, created_at, updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7)",
                params![
                    f["id"].as_str().unwrap_or(""),
                    f["name"].as_str().unwrap_or("Pasta"),
                    f["parentId"].as_str(),
                    f["icon"].as_str().unwrap_or("fa-folder"),
                    if f["expanded"].as_bool().unwrap_or(true) { 1 } else { 0 },
                    f["createdAt"].as_str().unwrap_or(""),
                    f["updatedAt"].as_str().unwrap_or(""),
                ],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    if let Some(notes) = data.get("notes").and_then(|v| v.as_object()) {
        for (_, n) in notes {
            tx.execute(
                "INSERT INTO notes (id, title, content, folder_id, type, icon, created_at, updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
                params![
                    n["id"].as_str().unwrap_or(""),
                    n["title"].as_str().unwrap_or("Nota"),
                    n["content"].as_str().unwrap_or(""),
                    n["folderId"].as_str(),
                    n["type"].as_str().unwrap_or("text"),
                    n["icon"].as_str().unwrap_or("fa-file-lines"),
                    n["createdAt"].as_str().unwrap_or(""),
                    n["updatedAt"].as_str().unwrap_or(""),
                ],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    if let Some(settings) = data.get("settings").and_then(|v| v.as_object()) {
        for (k, v) in settings {
            let val = serde_json::to_string(v).unwrap_or_else(|_| "null".into());
            tx.execute(
                "INSERT INTO settings (key, value) VALUES (?1, ?2)",
                params![k.as_str(), val],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn db_load(state: tauri::State<'_, DbState>) -> Result<Value, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    load_all(&conn)
}

#[tauri::command]
fn db_save(state: tauri::State<'_, DbState>, data: Value) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    save_all(&conn, &data)
}

#[tauri::command]
fn db_path_info() -> String {
    db_path().to_string_lossy().to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let path = db_path();
            let conn = Connection::open(&path).expect("failed to open database");
            init_schema(&conn).expect("failed to init schema");
            app.manage(DbState(Mutex::new(conn)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![db_load, db_save, db_path_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
