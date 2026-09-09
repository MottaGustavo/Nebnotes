Object.assign(App, {
saveCurrentNote(showToast = false) {
if (!this.currentNoteId) return;
const title = document.getElementById('noteTitle').value.trim() || 'Sem título';
const content = document.getElementById('noteContent').value;
Storage.updateNote(this.currentNoteId, { title, content });
this.renderTree();
if (showToast) toast('Nota salva');
},
promptNewFolder(parentId) {
this.openModal('Nova pasta', `
<div class="form-group">
<label>Nome</label>
<input type="text" class="form-input" id="inputName" placeholder="Ex: Python, Banco de Dados..." autofocus>
</div>
`, [
{ label: 'Cancelar', action: () => this.closeModal() },
{ label: 'Criar', primary: true, action: () => {
const name = document.getElementById('inputName').value.trim();
if (!name) return toast('Digite um nome', 'error');
const folder = Storage.createFolder({ name, parentId });
this.closeModal();
this.renderTree();
this.openFolder(folder.id);
toast('Pasta criada');
}},
]);
setTimeout(() => document.getElementById('inputName')?.focus(), 50);
},
promptNewNote(folderId) {
const types = Storage.getNoteTypes();
this.openModal('Nova nota', `
<div class="form-group">
<label>Título</label>
<input type="text" class="form-input" id="inputName" placeholder="Título da nota" autofocus>
</div>
<div class="form-group">
<label>Tipo</label>
<select class="form-select" id="inputType">
${types.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}
</select>
</div>
`, [
{ label: 'Cancelar', action: () => this.closeModal() },
{ label: 'Criar', primary: true, action: () => {
const title = document.getElementById('inputName').value.trim() || 'Nova nota';
const type = document.getElementById('inputType').value;
const note = Storage.createNote({ title, folderId, type });
this.closeModal();
this.renderTree();
this.openNote(note.id);
toast('Nota criada');
}},
]);
setTimeout(() => document.getElementById('inputName')?.focus(), 50);
},
promptRename(type, id) {
const item = type === 'folder' ? Storage.getFolder(id) : Storage.getNote(id);
if (!item) return;
const currentName = type === 'folder' ? item.name : item.title;
this.openModal('Renomear', `
<div class="form-group">
<label>Novo nome</label>
<input type="text" class="form-input" id="inputName" value="${escapeHtml(currentName)}" autofocus>
</div>
`, [
{ label: 'Cancelar', action: () => this.closeModal() },
{ label: 'Salvar', primary: true, action: () => {
const name = document.getElementById('inputName').value.trim();
if (!name) return toast('Nome inválido', 'error');
if (type === 'folder') {
Storage.updateFolder(id, { name });
if (this.currentFolderId === id) document.getElementById('folderTitle').textContent = name;
} else {
Storage.updateNote(id, { title: name });
if (this.currentNoteId === id) document.getElementById('noteTitle').value = name;
}
this.closeModal();
this.renderTree();
toast('Renomeado');
}},
]);
setTimeout(() => {
const input = document.getElementById('inputName');
if (input) { input.focus(); input.select(); }
}, 50);
},
confirmDelete(type, id) {
const item = type === 'folder' ? Storage.getFolder(id) : Storage.getNote(id);
if (!item) return;
const name = type === 'folder' ? item.name : item.title;
const extra = type === 'folder' ? '<p class="form-hint" style="color:var(--danger)">Todas as subpastas e notas dentro desta pasta também serão excluídas.</p>' : '';
this.openModal('Confirmar exclusão', `
<p>Tem certeza que deseja excluir <strong>${escapeHtml(name)}</strong>?</p>
${extra}
`, [
{ label: 'Cancelar', action: () => this.closeModal() },
{ label: 'Excluir', danger: true, action: () => {
if (type === 'folder') {
Storage.deleteFolder(id);
if (this.currentFolderId === id) this.showDashboard();
} else {
Storage.deleteNote(id);
if (this.currentNoteId === id) this.showDashboard();
}
this.closeModal();
this.renderTree();
toast('Excluído');
}},
]);
},
promptMove(type, id) {
const folders = Storage.getFolders().filter(f => {
if (type === 'folder' && f.id === id) return false;
if (type === 'folder') {
let p = f.parentId;
while (p) {
if (p === id) return false;
p = Storage.getFolder(p)?.parentId;
}
}
return true;
});
const options = [
`<option value="">(Raiz)</option>`,
...folders.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`),
];
this.openModal('Mover para', `
<div class="form-group">
<label>Pasta de destino</label>
<select class="form-select" id="inputTarget">${options.join('')}</select>
</div>
`, [
{ label: 'Cancelar', action: () => this.closeModal() },
{ label: 'Mover', primary: true, action: () => {
const target = document.getElementById('inputTarget').value || null;
if (type === 'folder') {
Storage.updateFolder(id, { parentId: target });
} else {
Storage.updateNote(id, { folderId: target });
}
this.closeModal();
this.renderTree();
if (type === 'folder' && this.currentFolderId === id) this.openFolder(id);
else if (type === 'note' && this.currentNoteId === id) this.openNote(id);
toast('Movido');
}},
]);
},
});
