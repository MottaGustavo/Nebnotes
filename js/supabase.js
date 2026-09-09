/* ========================================
   SUBNOTED - SUPABASE.JS
   Integração com Supabase (TODO)
   ======================================== */

// Configuração Supabase (adicionar depois)
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIs...';

// TODO: Implementar quando tiver credenciais Supabase
const supabaseClient = null; // supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ========================================
// AUTENTICAÇÃO
// ========================================

async function signUp(email, password) {
  // TODO: Implementar
  console.log('Sign up:', email);
}

async function signIn(email, password) {
  // TODO: Implementar
  console.log('Sign in:', email);
}

async function signOut() {
  // TODO: Implementar
  console.log('Sign out');
}

// ========================================
// SNIPPETS
// ========================================

async function fetchSnippets() {
  // TODO: Buscar snippets do usuário
  console.log('Fetching snippets...');
}

async function createSnippet(data) {
  // TODO: Criar snippet
  console.log('Creating snippet...', data);
}

async function updateSnippet(id, data) {
  // TODO: Atualizar snippet
  console.log('Updating snippet...', id, data);
}

async function deleteSnippet(id) {
  // TODO: Deletar snippet
  console.log('Deleting snippet...', id);
}

// ========================================
// PASTAS
// ========================================

async function fetchFolders() {
  // TODO: Buscar pastas do usuário
  console.log('Fetching folders...');
}

async function createFolder(data) {
  // TODO: Criar pasta
  console.log('Creating folder...', data);
}

// ========================================
// TAGS
// ========================================

async function fetchTags(snippetId) {
  // TODO: Buscar tags
  console.log('Fetching tags...', snippetId);
}

async function addTag(snippetId, tagName) {
  // TODO: Adicionar tag
  console.log('Adding tag...', snippetId, tagName);
}

// ========================================
// VERSIONING
// ========================================

async function fetchVersions(snippetId) {
  // TODO: Buscar versões
  console.log('Fetching versions...', snippetId);
}

async function createVersion(snippetId, code) {
  // TODO: Criar versão
  console.log('Creating version...', snippetId, code);
}

// ========================================
// COMPARTILHAMENTO
// ========================================

async function generateShareLink(snippetId) {
  // TODO: Gerar link compartilhável
  console.log('Generating share link...', snippetId);
}

async function fetchSharedSnippet(shareId) {
  // TODO: Buscar snippet compartilhado
  console.log('Fetching shared snippet...', shareId);
}
