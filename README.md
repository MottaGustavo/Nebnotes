# NebNotes

Aplicativo pessoal **local-first** para organizar conhecimento.

> Um lugar para guardar, organizar e consultar tudo que você aprende.

## Filosofia

```
CRIAR → ORGANIZAR → EDITAR → CONSULTAR
```

Simples, rápido e offline. Sem conta, sem servidor, sem colaboração.

## Funcionalidades

- **Árvore de pastas e subpastas** livre
- **Notas** com Markdown, syntax highlighting e tipos/ícones
- **Dashboard** com visão geral e notas recentes
- **Breadcrumbs** e menu de contexto
- **Persistência local**: SQLite no desktop · localStorage no navegador
- **Importar / Exportar** backup JSON + export de nota em Markdown
- **Tema claro/escuro** e configurações de fonte
- **Sem execução de código** — código é apenas conteúdo

## Stack

- HTML / CSS / JavaScript puro
- marked.js + highlight.js (CDN)
- Font Awesome
- **SQLite** (rusqlite) no desktop via Tauri

## Como executar (navegador — testar agora)

```bash
git clone https://github.com/MottaGustavo/Nebnotes.git
cd Nebnotes

# Opção 1: abrir direto
# Windows: start index.html
# macOS: open index.html
# Linux: xdg-open index.html

# Opção 2: servidor local
npx serve . -p 1420
# depois: http://localhost:1420
```

## Desktop com SQLite (Tauri)

### Pré-requisitos
- Node.js 18+
- Rust (https://rustup.rs)
- Dependências do SO: https://v2.tauri.app/start/prerequisites/

### Rodar
```bash
npm install
npm run tauri:dev
```

### Gerar instalável Windows
```bash
npm run tauri:build
# Artefatos em: src-tauri/target/release/bundle/
```

Arquivo SQLite:
- Windows: `%APPDATA%\NebNotes\nebnotes.db`
- Linux: `~/.local/share/NebNotes/nebnotes.db`
- macOS: `~/Library/Application Support/NebNotes/nebnotes.db`

## Estrutura

```
Nebnotes/
├── index.html
├── css/style.css
├── js/
│   ├── storage.js   # localStorage + SQLite
│   ├── utils.js
│   └── app.js
├── src-tauri/       # Tauri + rusqlite
├── package.json
└── README.md
```
