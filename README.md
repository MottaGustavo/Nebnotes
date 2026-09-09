# NebNotes

Plataforma web para organizar seus estudos de programação em uma estrutura em árvore com editor de código, anotações renderizadas, tags e compartilhamento.

## 🎯 Objetivo

NebNotes é uma ferramenta de aprendizado que permite você:
- 📚 Organizar estudos em árvore (Programação > Java > If Básico)
- ✏️ Escrever e editar código com anotações
- 🏷️ Adicionar tags customizáveis
- 📝 Versionar seu código
- 🔗 Compartilhar snippets públicos
- 📊 Filtrar por tags

## 🎨 Paleta de Cores

- **Background:** #f5f1ed (Bege warm)
- **Sidebar:** #efefef (Cinza prata)
- **Cards:** #fafaf8 (Branco off)
- **Accent:** #8b3a3a (Vermelho Escuro)
- **Gradiente:** #8b3a3a → #5c2424

## 🏗️ Estrutura do Projeto

```
subnoted/
├── index.html          # HTML principal
├── css/
│   └── style.css       # Estilos globais + paleta
├── js/
│   ├── app.js          # Lógica principal
│   ├── supabase.js     # Integração Supabase (TODO)
│   └── utils.js        # Funções auxiliares
├── README.md           # Este arquivo
└── .gitignore         # Git ignore
```

## 🚀 Próximos Passos

### Fase 1: Setup Supabase (Semana 1)
- [ ] Criar projeto Supabase
- [ ] Criar tabelas (users, folders, snippets, tags, versions)
- [ ] Configurar autenticação

### Fase 2: Frontend + Backend (Semana 2-3)
- [ ] Conectar Supabase ao app
- [ ] CRUD de snippets
- [ ] CRUD de pastas
- [ ] Navegação em árvore

### Fase 3: Features Avançadas (Semana 4)
- [ ] Versionamento
- [ ] Compartilhamento público
- [ ] Filtro por tags

### Fase 4: Deploy (Semana 5)
- [ ] Deploy Vercel
- [ ] Conectar domínio próprio

## 🛠️ Stack

- **Frontend:** HTML/CSS/JavaScript Puro
- **Banco de Dados:** Supabase (PostgreSQL)
- **Hospedagem:** Vercel
- **Versionamento:** GitHub

## 📦 Como Usar

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/subnoted.git
cd subnoted
```

2. Abra `index.html` no navegador

3. (Em breve) Configure Supabase e conecte o banco

## 📝 Componentes Principais

### Sidebar
- Árvore de pastas navegável
- Expandível/colapsável
- Highlight em vermelho para item ativo

### Editor
- Textarea para código
- Textarea para anotações
- Seletor de versão
- Botões salvar/deletar

### Painel Direito
- Pré-visualização de anotações (markdown)
- Tags customizáveis
- Botão compartilhamento
- Toggle Privado/Público

## 🎓 Features

- ✅ Árvore de pastas
- ✅ Editor de código
- ✅ Anotações em Markdown
- ✅ Tags
- ✅ Versionamento (estrutura pronta)
- ✅ Compartilhamento público (estrutura pronta)
- ⏳ Filtro por tags
- ⏳ Export PDF
- ⏳ Autenticação
- ⏳ Sync Supabase

## 📧 Contato

Gustavo | Brusque, SC | 2025

---

**Status:** Em desenvolvimento ⚙️
