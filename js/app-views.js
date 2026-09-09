Object.assign(App, {
showDashboard() {
this.currentView = 'dashboard';
this.currentNoteId = null;
this.currentFolderId = null;
this.hideAllViews();
document.getElementById('dashboardView').classList.remove('hidden');
this.renderBreadcrumbs([]);
this.renderDashboard();
this.renderTree();
},
renderDashboard() {
const stats = Storage.getStats();
document.getElementById('statFolders').textContent = stats.folders;
document.getElementById('statNotes').textContent = stats.notes;
document.getElementById('statTypes').textContent = stats.types;
const recent = Storage.getRecentNotes(6);
const recentEl = document.getElementById('recentNotes');
if (recent.length === 0) {
recentEl.innerHTML = '<div class="empty-state">Nenhuma nota ainda.</div>';
} else {
recentEl.innerHTML = recent.map(n => {
const type = Storage.getNoteTypes().find(t => t.id === n.type);
return `
<div class="recent-item" data-id="${n.id}">
<i class="fas ${n.icon || type?.icon || 'fa-file-lines'}"></i>
<div class="meta">
<div class="name">${escapeHtml(n.title)}</div>
<div class="time">${relativeTime(n.updatedAt)}</div>
</div>
</div>
`;
}).join('');
recentEl.querySelectorAll('.recent-item').forEach(el => {
el.addEventListener('click', () => this.openNote(el.dataset.id));
});
}
const roots = Storage.getRootFolders();
const foldersEl = document.getElementById('rootFolders');
if (roots.length === 0) {
foldersEl.innerHTML = '<div class="empty-state">Nenhuma pasta ainda.</div>';
} else {
foldersEl.innerHTML = roots.map(f => `
<div class="folder-card" data-id="${f.id}">
<i class="fas ${f.icon || 'fa-folder'}"></i>
<span class="name">${escapeHtml(f.name)}</span>
</div>
`).join('');
foldersEl.querySelectorAll('.folder-card').forEach(el => {
el.addEventListener('click', () => this.openFolder(el.dataset.id));
});
}
},
openFolder(folderId) {
const folder = Storage.getFolder(folderId);
if (!folder) return;
this.currentView = 'folder';
this.currentFolderId = folderId;
this.currentNoteId = null;
this.hideAllViews();
document.getElementById('folderView').classList.remove('hidden');
document.getElementById('folderTitle').textContent = folder.name;
document.getElementById('folderIconDisplay').className = `fas ${folder.icon || 'fa-folder-open'} folder-icon-large`;
const path = Storage.getPath(folderId);
this.renderBreadcrumbs(path);
const content = document.getElementById('folderContent');
const childFolders = Storage.getChildFolders(folderId);
const notes = Storage.getNotesInFolder(folderId);
if (childFolders.length === 0 && notes.length === 0) {
content.innerHTML = '<div class="empty-state">Pasta vazia. Crie uma nota ou subpasta.</div>';
} else {
let html = '';
childFolders.forEach(f => {
html += `
<div class="content-card" data-type="folder" data-id="${f.id}">
<div class="card-icon"><i class="fas ${f.icon || 'fa-folder'}"></i></div>
<div class="card-title">${escapeHtml(f.name)}</div>
<div class="card-meta">Pasta</div>
</div>
`;
});
notes.forEach(n => {
const type = Storage.getNoteTypes().find(t => t.id === n.type);
html += `
<div class="content-card" data-type="note" data-id="${n.id}">
<div class="card-icon"><i class="fas ${n.icon || type?.icon || 'fa-file-lines'}"></i></div>
<div class="card-title">${escapeHtml(n.title)}</div>
<div class="card-meta">${type?.label || n.type} · ${relativeTime(n.updatedAt)}</div>
</div>
`;
});
content.innerHTML = html;
content.querySelectorAll('.content-card').forEach(card => {
card.addEventListener('click', () => {
if (card.dataset.type === 'folder') this.openFolder(card.dataset.id);
else this.openNote(card.dataset.id);
});
card.addEventListener('contextmenu', (e) => {
e.preventDefault();
this.showContextMenu(e, card.dataset.type, card.dataset.id);
});
});
}
path.forEach(f => {
if (!f.expanded) Storage.updateFolder(f.id, { expanded: true });
});
this.renderTree();
},
openNote(noteId) {
const note = Storage.getNote(noteId);
if (!note) return;
this.currentView = 'note';
this.currentNoteId = noteId;
this.currentFolderId = note.folderId;
this.hideAllViews();
document.getElementById('editorView').classList.remove('hidden');
document.getElementById('noteTitle').value = note.title;
document.getElementById('noteContent').value = note.content;
const type = Storage.getNoteTypes().find(t => t.id === note.type) || Storage.getNoteTypes()[0];
const typeBtn = document.getElementById('noteTypeBtn');
typeBtn.innerHTML = `<i class="fas ${note.icon || type.icon}"></i><span>${type.label}</span>`;
const path = note.folderId ? Storage.getPath(note.folderId) : [];
this.renderBreadcrumbs(path, note.title);
if (this.previewOpen) this.updatePreview();
this.renderTree();
},
hideAllViews() {
document.getElementById('dashboardView').classList.add('hidden');
document.getElementById('editorView').classList.add('hidden');
document.getElementById('folderView').classList.add('hidden');
},
renderBreadcrumbs(folderPath, noteTitle = null) {
const el = document.getElementById('breadcrumbs');
let html = `<span class="crumb" data-action="dashboard">Início</span>`;
folderPath.forEach((f, i) => {
html += `<span class="crumb-sep"><i class="fas fa-chevron-right"></i></span>`;
const isLast = i === folderPath.length - 1 && !noteTitle;
html += `<span class="crumb ${isLast ? 'current' : ''}" data-folder="${f.id}">${escapeHtml(f.name)}</span>`;
});
if (noteTitle) {
html += `<span class="crumb-sep"><i class="fas fa-chevron-right"></i></span>`;
html += `<span class="crumb current">${escapeHtml(noteTitle)}</span>`;
}
el.innerHTML = html;
el.querySelectorAll('.crumb[data-action="dashboard"]').forEach(c => c.addEventListener('click', () => this.showDashboard()));
el.querySelectorAll('.crumb[data-folder]').forEach(c => {
c.addEventListener('click', () => this.openFolder(c.dataset.folder));
});
},
});
