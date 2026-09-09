/* ========================================
   NebNotes - Storage Layer
   Browser  → localStorage
   Desktop  → SQLite (via Tauri + rusqlite)
   ======================================== */

const STORAGE_KEY = 'nebnotes_data_v1';

const DEFAULT_NOTE_TYPES = [
  { id: 'text', label: 'Texto', icon: 'fa-file-lines' },
  { id: 'code', label: 'Código', icon: 'fa-code' },
  { id: 'idea', label: 'Ideia', icon: 'fa-lightbulb' },
  { id: 'concept', label: 'Conceito', icon: 'fa-book' },
  { id: 'tutorial', label: 'Tutorial', icon: 'fa-graduation-cap' },
  { id: 'command', label: 'Comando', icon: 'fa-terminal' },
  { id: 'note', label: 'Anotação', icon: 'fa-sticky-note' },
  { id: 'reference', label: 'Referência', icon: 'fa-bookmark' },
];

const DEFAULT_FOLDER_ICONS = [
  { id: 'folder', icon: 'fa-folder' },
  { id: 'folder-open', icon: 'fa-folder-open' },
  { id: 'code', icon: 'fa-code' },
  { id: 'book', icon: 'fa-book' },
  { id: 'laptop', icon: 'fa-laptop-code' },
  { id: 'database', icon: 'fa-database' },
  { id: 'server', icon: 'fa-server' },
  { id: 'project', icon: 'fa-diagram-project' },
  { id: 'star', icon: 'fa-star' },
  { id: 'heart', icon: 'fa-heart' },
  { id: 'flag', icon: 'fa-flag' },
  { id: 'box', icon: 'fa-box' },
];

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
}

function isTauri() {
  return !!(window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke);
}

async function tauriInvoke(cmd, args = {}) {
  return window.__TAURI__.core.invoke(cmd, args);
}

function getDefaultData() {
  const now = new Date().toISOString();
  const rootProg = createId();
  const rootFacul = createId();
  const javaId = createId();
  const note1 = createId();

  return {
    version: 1,
    folders: {
      [rootProg]: {
        id: rootProg,
        name: 'Programação',
        parentId: null,
        icon: 'fa-laptop-code',
        expanded: true,
        createdAt: now,
        updatedAt: now,
      },
      [javaId]: {
        id: javaId,
        name: 'Java',
        parentId: rootProg,
        icon: 'fa-folder',
        expanded: true,
        createdAt: now,
        updatedAt: now,
      },
      [rootFacul]: {
        id: rootFacul,
        name: 'Faculdade',
        parentId: null,
        icon: 'fa-graduation-cap',
        expanded: false,
        createdAt: now,
        updatedAt: now,
      },
    },
    notes: {
      [note1]: {
        id: note1,
        title: 'Variáveis e Tipos',
        content: '# Variáveis em Java\n\nEm Java, toda variável precisa de um **tipo** declarado.\n\n```java\nint idade = 25;\nString nome = "Gustavo";\nboolean ativo = true;\ndouble altura = 1.75;\n```\n\n## Tipos primitivos\n\n- `int` — números inteiros\n- `double` — decimais\n- `boolean` — true/false\n- `char` — um caractere\n\n> Dica: use nomes descritivos.',
        folderId: javaId,
        type: 'code',
        icon: 'fa-code',
        createdAt: now,
        updatedAt: now,
      },
    },
    settings: {
      theme: 'light',
      fontSize: 14,
      previewDefault: false,
    },
  };
}

const Storage = {
  data: null,
  _ready: false,
  _backend: 'localStorage',

  async load() {
    try {
      if (isTauri()) {
        this._backend = 'sqlite';
        const loaded = await tauriInvoke('db_load');
        if (loaded && (Object.keys(loaded.folders || {}).length > 0 || Object.keys(loaded.notes || {}).length > 0)) {
          this.data = loaded;
        } else {
          this.data = getDefaultData();
          await this._persist();
        }
      } else {
        this._backend = 'localStorage';
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.data = JSON.parse(raw);
          if (!this.data.folders) this.data.folders = {};
          if (!this.data.notes) this.data.notes = {};
          if (!this.data.settings) this.data.settings = getDefaultData().settings;
        } else {
          this.data = getDefaultData();
          await this._persist();
        }
      }
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
      this.data = getDefaultData();
    }
    this._ready = true;
    return this.data;
  },

  async _persist() {
    if (!this.data) return;
    try {
      if (this._backend === 'sqlite' && isTauri()) {
        await tauriInvoke('db_save', { data: this.data });
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch (e) {
      console.error('Erro ao salvar:', e);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (_) {}
      throw e;
    }
  },

  save() {
    this._persist().catch(err => console.error('Persist failed:', err));
  },

  getBackend() {
    return this._backend;
  },

  async getDbPath() {
    if (isTauri()) {
      try {
        return await tauriInvoke('db_path_info');
      } catch {
        return null;
      }
    }
    return null;
  },

  getFolders() {
    return Object.values(this.data.folders);
  },

  getFolder(id) {
    return this.data.folders[id] || null;
  },

  getRootFolders() {
    return this.getFolders().filter(f => !f.parentId);
  },

  getChildFolders(parentId) {
    return this.getFolders()
      .filter(f => f.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  },

  createFolder({ name, parentId = null, icon = 'fa-folder' }) {
    const id = createId();
    const now = new Date().toISOString();
    this.data.folders[id] = {
      id,
      name: name.trim() || 'Nova pasta',
      parentId,
      icon,
      expanded: true,
      createdAt: now,
      updatedAt: now,
    };
    this.save();
    return this.data.folders[id];
  },

  updateFolder(id, updates) {
    const folder = this.data.folders[id];
    if (!folder) return null;
    Object.assign(folder, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return folder;
  },

  deleteFolder(id) {
    const children = this.getChildFolders(id);
    children.forEach(c => this.deleteFolder(c.id));
    const notes = this.getNotesInFolder(id);
    notes.forEach(n => this.deleteNote(n.id));
    delete this.data.folders[id];
    this.save();
  },

  toggleExpanded(id) {
    const folder = this.data.folders[id];
    if (folder) {
      folder.expanded = !folder.expanded;
      this.save();
    }
  },

  getNotes() {
    return Object.values(this.data.notes);
  },

  getNote(id) {
    return this.data.notes[id] || null;
  },

  getNotesInFolder(folderId) {
    return this.getNotes()
      .filter(n => n.folderId === folderId)
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  },

  getRecentNotes(limit = 8) {
    return this.getNotes()
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit);
  },

  createNote({ title, content = '', folderId = null, type = 'text', icon = null }) {
    const id = createId();
    const now = new Date().toISOString();
    const typeDef = DEFAULT_NOTE_TYPES.find(t => t.id === type) || DEFAULT_NOTE_TYPES[0];
    this.data.notes[id] = {
      id,
      title: title.trim() || 'Nova nota',
      content,
      folderId,
      type: typeDef.id,
      icon: icon || typeDef.icon,
      createdAt: now,
      updatedAt: now,
    };
    this.save();
    return this.data.notes[id];
  },

  updateNote(id, updates) {
    const note = this.data.notes[id];
    if (!note) return null;
    Object.assign(note, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return note;
  },

  deleteNote(id) {
    delete this.data.notes[id];
    this.save();
  },

  getSettings() {
    return this.data.settings;
  },

  updateSettings(updates) {
    Object.assign(this.data.settings, updates);
    this.save();
  },

  getStats() {
    const notes = this.getNotes();
    const types = new Set(notes.map(n => n.type));
    return {
      folders: this.getFolders().length,
      notes: notes.length,
      types: types.size,
    };
  },

  exportData() {
    return JSON.stringify(this.data, null, 2);
  },

  async importData(jsonString) {
    const parsed = JSON.parse(jsonString);
    if (!parsed.folders || !parsed.notes) {
      throw new Error('Arquivo de backup inválido');
    }
    this.data = {
      version: parsed.version || 1,
      folders: parsed.folders,
      notes: parsed.notes,
      settings: parsed.settings || getDefaultData().settings,
    };
    await this._persist();
  },

  exportNoteAsMarkdown(noteId) {
    const note = this.getNote(noteId);
    if (!note) return null;
    const typeDef = DEFAULT_NOTE_TYPES.find(t => t.id === note.type);
    let md = '# ' + note.title + '\n\n';
    md += '> Tipo: ' + (typeDef ? typeDef.label : note.type) + '\n\n';
    md += note.content;
    return md;
  },

  getPath(folderId) {
    const path = [];
    let current = folderId;
    while (current) {
      const folder = this.getFolder(current);
      if (!folder) break;
      path.unshift(folder);
      current = folder.parentId;
    }
    return path;
  },

  getNoteTypes() {
    return DEFAULT_NOTE_TYPES;
  },

  getFolderIcons() {
    return DEFAULT_FOLDER_ICONS;
  },
};
