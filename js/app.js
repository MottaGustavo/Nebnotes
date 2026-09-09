/* ========================================
   NebNotes - Application Core
   ======================================== */

const App = {
  currentView: 'dashboard',
  currentNoteId: null,
  currentFolderId: null,
  contextTarget: null,
  previewOpen: false,
  saveTimer: null,

  async init() {
    await Storage.load();
    this.applySettings();
    this.bindEvents();
    this.renderTree();
    this.showDashboard();
    console.log('[NebNotes] Backend:', Storage.getBackend());
    if (Storage.getBackend() === 'sqlite') {
      Storage.getDbPath().then(path => console.log('[NebNotes] SQLite:', path));
    }
  },

  applySettings() {
    const s = Storage.getSettings();
    applyTheme(s.theme || 'light');
    document.documentElement.style.setProperty('--editor-font-size', (s.fontSize || 14) + 'px');
    const content = document.getElementById('noteContent');
    if (content) content.style.fontSize = (s.fontSize || 14) + 'px';
  },

  bindEvents() {
    document.getElementById('btnNewFolder').addEventListener('click', () => this.promptNewFolder(null));
    document.getElementById('btnNewNote').addEventListener('click', () => this.promptNewNote(this.currentFolderId));
    document.getElementById('btnSettings').addEventListener('click', () => this.openSettings());
    document.getElementById('btnDashboard').addEventListener('click', () => this.showDashboard());
    document.getElementById('logoBtn').addEventListener('click', () => this.showDashboard());
    document.getElementById('dashNewNote').addEventListener('click', () => this.promptNewNote(null));
    document.getElementById('dashNewFolder').addEventListener('click', () => this.promptNewFolder(null));
    document.getElementById('btnSaveNote').addEventListener('click', () => this.saveCurrentNote(true));
    document.getElementById('noteTitle').addEventListener('input', debounce(() => this.saveCurrentNote(), 600));
    document.getElementById('noteContent').addEventListener('input', debounce(() => {
      this.saveCurrentNote();
      if (this.previewOpen) this.updatePreview();
    }, 500));
    document.getElementById('noteTypeBtn').addEventListener('click', () => this.openTypePicker());
    document.getElementById('btnTogglePreview').addEventListener('click', () => this.togglePreview());
    document.querySelectorAll('.tb-btn[data-md]').forEach(btn => {
      btn.addEventListener('click', () => this.insertMarkdown(btn.dataset.md));
    });
    document.getElementById('btnFolderNewNote').addEventListener('click', () => this.promptNewNote(this.currentFolderId));
    document.getElementById('btnFolderNewSubfolder').addEventListener('click', () => this.promptNewFolder(this.currentFolderId));
    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });
    document.getElementById('pickerOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closePicker();
    });
    document.addEventListener('click', () => this.hideContextMenu());
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (this.currentView === 'note') this.saveCurrentNote(true);
      }
      if (e.key === 'Escape') {
        this.hideContextMenu();
        this.closeModal();
        this.closePicker();
      }
    });
  },

  renderTree() {
    const container = document.getElementById('treeContainer');
    container.innerHTML = '';
    const roots = Storage.getRootFolders().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (roots.length === 0) {
      container.innerHTML = '<div class="empty-state" style="padding:16px;text-align:center;">Nenhuma pasta ainda.<br>Crie a primeira!</div>';
      return;
    }
    roots.forEach(f => container.appendChild(this.buildTreeNode(f)));
  },

  buildTreeNode(folder) {
    const childrenFolders = Storage.getChildFolders(folder.id);
    const notes = Storage.getNotesInFolder(folder.id);
    const hasChildren = childrenFolders.length > 0 || notes.length > 0;
    const wrap = document.createElement('div');
    wrap.className = 'tree-node';
    const item = document.createElement('div');
    item.className = 'tree-item';
    item.dataset.id = folder.id;
    item.dataset.type = 'folder';
    if (this.currentView === 'folder' && this.currentFolderId === folder.id) item.classList.add('active');
    item.innerHTML = `
      <span class="chevron ${folder.expanded ? 'expanded' : ''} ${hasChildren ? '' : 'empty'}">
        <i class="fas fa-chevron-right"></i>
      </span>
      <span class="item-icon"><i class="fas ${folder.icon || 'fa-folder'}"></i></span>
      <span class="item-name">${escapeHtml(folder.name)}</span>
    `;
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target.closest('.chevron') && hasChildren) {
        Storage.toggleExpanded(folder.id);
        this.renderTree();
        return;
      }
      this.openFolder(folder.id);
    });
    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showContextMenu(e, 'folder', folder.id);
    });
    wrap.appendChild(item);
    const childrenEl = document.createElement('div');
    childrenEl.className = `tree-children ${folder.expanded ? 'open' : ''}`;
    childrenFolders.forEach(cf => childrenEl.appendChild(this.buildTreeNode(cf)));
    notes.forEach(note => {
      const nItem = document.createElement('div');
      nItem.className = 'tree-item';
      nItem.dataset.id = note.id;
      nItem.dataset.type = 'note';
      if (this.currentView === 'note' && this.currentNoteId === note.id) nItem.classList.add('active');
      nItem.innerHTML = `
        <span class="chevron empty"></span>
        <span class="item-icon"><i class="fas ${note.icon || 'fa-file-lines'}"></i></span>
        <span class="item-name">${escapeHtml(note.title)}</span>
      `;
      nItem.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openNote(note.id);
      });
      nItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showContextMenu(e, 'note', note.id);
      });
      childrenEl.appendChild(nItem);
    });
    wrap.appendChild(childrenEl);
    return wrap;
  },
};
