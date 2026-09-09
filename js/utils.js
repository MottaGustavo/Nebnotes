/* ========================================
   SUBNOTED - UTILS.JS
   Funções auxiliares
   ======================================== */

// ========================================
// MARKDOWN PARSER (SIMPLES)
// ========================================

function parseMarkdown(text) {
  let html = text;

  // **bold**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // _italic_
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // `code`
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // # Heading 1
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // ## Heading 2
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');

  // - List items
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');

  // Quebra de linhas
  html = html.replace(/\n/g, '<br>');

  return html;
}

// ========================================
// LOCAL STORAGE
// ========================================

function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
}

function getFromLocalStorage(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Erro ao ler do localStorage:', error);
    return null;
  }
}

function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Erro ao remover do localStorage:', error);
  }
}

// ========================================
// VALIDAÇÃO
// ========================================

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function isValidPassword(password) {
  return password.length >= 6;
}

function isValidTag(tag) {
  return tag.trim().length > 0 && tag.length <= 30;
}

// ========================================
// STRING UTILS
// ========================================

function truncate(text, length = 50) {
  return text.length > length ? text.substr(0, length) + '...' : text;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// ========================================
// DATE UTILS
// ========================================

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('pt-BR');
}

function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d atrás`;
  if (hours > 0) return `${hours}h atrás`;
  if (minutes > 0) return `${minutes}m atrás`;
  return 'agora';
}

// ========================================
// ARRAY UTILS
// ========================================

function removeDuplicates(array) {
  return [...new Set(array)];
}

function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
}

function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
}

// ========================================
// COPY TO CLIPBOARD
// ========================================

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar:', error);
    return false;
  }
}

// ========================================
// DOWNLOAD FILE
// ========================================

function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ========================================
// DEBOUNCE
// ========================================

function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ========================================
// THROTTLE
// ========================================

function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
