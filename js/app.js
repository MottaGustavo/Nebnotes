/* ========================================
   SUBNOTED - APP.JS
   Lógica principal da aplicação
   ======================================== */

// Estado global
let currentSnippet = {
  id: 'if-basico',
  title: 'If Básico',
  code: `if (x > 5) {
  System.out.println("Maior que 5");
}
else {
  System.out.println("Menor ou igual");
}`,
  annotations: `Aprendi na aula 5.
Diferença entre if e if/else.
Usar **>=** para maior ou igual.`,
  tags: ['Escola', 'Condicional'],
  version: 2,
  public: false,
};

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  loadSnippet();
});

// ========================================
// EVENT LISTENERS
// ========================================

function initializeEventListeners() {
  // Sidebar - navegação
  const folderItems = document.querySelectorAll('.folder-item');
  folderItems.forEach(item => {
    item.addEventListener('click', handleFolderClick);
  });

  // Editor
  document.getElementById('codeEditor').addEventListener('change', saveSnippet);
  document.getElementById('annotationsEditor').addEventListener('change', updatePreview);
  document.getElementById('saveButton').addEventListener('click', saveSnippet);
  document.getElementById('deleteButton').addEventListener('click', deleteSnippet);

  // Tags
  document.getElementById('addTagButton').addEventListener('click', addTag);
  document.getElementById('tagInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTag();
      e.preventDefault();
    }
  });

  // Compartilhamento
  document.getElementById('publicToggle').addEventListener('change', togglePublic);
  document.getElementById('shareButton').addEventListener('click', copyShareLink);

  // Outros
  document.getElementById('versionSelect').addEventListener('change', loadVersion);
  document.getElementById('filterTags').addEventListener('change', filterByTag);
  document.getElementById('exportPDF').addEventListener('click', exportPDF);
}

// ========================================
// SIDEBAR - NAVEGAÇÃO
// ========================================

function handleFolderClick(e) {
  // Remove active de todos
  document.querySelectorAll('.folder-item').forEach(item => {
    item.classList.remove('active');
  });

  // Adiciona active ao clicado
  this.classList.add('active');

  // Carrega snippet
  const id = this.getAttribute('data-id');
  loadSnippet(id);
}

// ========================================
// CARREGAR SNIPPET
// ========================================

function loadSnippet(id = null) {
  if (id) {
    currentSnippet.id = id;
    currentSnippet.title = document.querySelector(`[data-id="${id}"]`).textContent.trim();
  }

  // Atualizar título
  document.getElementById('currentTitle').textContent = `${currentSnippet.title} · Java`;

  // Carregar código
  document.getElementById('codeEditor').value = currentSnippet.code;

  // Carregar anotações
  document.getElementById('annotationsEditor').value = currentSnippet.annotations;

  // Atualizar preview
  updatePreview();

  // Atualizar tags
  updateTagsList();

  // Atualizar compartilhamento
  document.getElementById('publicToggle').checked = currentSnippet.public;
}

// ========================================
// ANOTAÇÕES - PREVIEW
// ========================================

function updatePreview() {
  const annotations = document.getElementById('annotationsEditor').value;
  const preview = document.getElementById('annotationsPreview');

  // Simples markdown parser
  let html = annotations
    .split('\n')
    .map(line => {
      if (!line.trim()) return '';
      
      // **bold**
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // _italic_
      line = line.replace(/_(.*?)_/g, '<em>$1</em>');
      
      // `code`
      line = line.replace(/`(.*?)`/g, '<code>$1</code>');
      
      return `<p>${line}</p>`;
    })
    .join('');

  preview.innerHTML = html || '<p style="color: #999;">Nenhuma anotação...</p>';
}

// ========================================
// TAGS
// ========================================

function addTag() {
  const input = document.getElementById('tagInput');
  const tag = input.value.trim();

  if (!tag) return;
  if (currentSnippet.tags.includes(tag)) {
    alert('Tag já existe!');
    return;
  }

  currentSnippet.tags.push(tag);
  input.value = '';
  updateTagsList();
  saveSnippet();
}

function removeTag(tag) {
  currentSnippet.tags = currentSnippet.tags.filter(t => t !== tag);
  updateTagsList();
  saveSnippet();
}

function updateTagsList() {
  const tagsList = document.getElementById('tagsList');
  tagsList.innerHTML = currentSnippet.tags
    .map(tag => `
      <span class="tag-badge">
        ${tag}
        <i class="fas fa-times" onclick="removeTag('${tag}')"></i>
      </span>
    `)
    .join('');
}

// ========================================
// COMPARTILHAMENTO
// ========================================

function togglePublic(e) {
  currentSnippet.public = e.target.checked;
  saveSnippet();

  if (currentSnippet.public) {
    generateShareLink();
  } else {
    document.getElementById('shareLink').value = '';
  }
}

function generateShareLink() {
  const hash = Math.random().toString(36).substr(2, 9);
  const link = `${window.location.origin}?share=${hash}`;
  document.getElementById('shareLink').value = link;
}

function copyShareLink() {
  const link = document.getElementById('shareLink');
  if (!link.value) {
    alert('Faça público antes de compartilhar!');
    return;
  }

  navigator.clipboard.writeText(link.value);
  alert('Link copiado!');
}

// ========================================
// VERSIONING
// ========================================

function loadVersion(e) {
  const version = e.target.value;
  // TODO: Carregar versão do Supabase
  console.log(`Carregando versão ${version}...`);
}

// ========================================
// FILTROS
// ========================================

function filterByTag(e) {
  const tag = e.target.value;
  // TODO: Filtrar snippets por tag
  console.log(`Filtrando por tag: ${tag}`);
}

// ========================================
// SALVAR/DELETAR
// ========================================

function saveSnippet() {
  currentSnippet.code = document.getElementById('codeEditor').value;
  currentSnippet.annotations = document.getElementById('annotationsEditor').value;

  // TODO: Salvar no Supabase
  console.log('Snipper salvo:', currentSnippet);
  showMessage('✓ Salvo!');
}

function deleteSnippet() {
  if (confirm('Tem certeza que quer deletar?')) {
    // TODO: Deletar do Supabase
    console.log('Snippet deletado');
    showMessage('Deletado!', 'error');
  }
}

// ========================================
// EXPORT PDF
// ========================================

function exportPDF() {
  // TODO: Gerar PDF com html2pdf ou similar
  alert('Export PDF - em desenvolvimento');
  console.log('Exportando para PDF...');
}

// ========================================
// UTILS
// ========================================

function showMessage(text, type = 'success') {
  const message = document.createElement('div');
  message.textContent = text;
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    background: ${type === 'success' ? '#8b3a3a' : '#d32f2f'};
    color: white;
    border-radius: 4px;
    z-index: 1000;
  `;
  document.body.appendChild(message);

  setTimeout(() => message.remove(), 2000);
}
