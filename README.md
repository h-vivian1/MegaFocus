# Documentação do Projeto MegaFocus

## 🚀 Visão Geral
MegaFocus é uma aplicação de produtividade "Tudo-em-Um" que combina um quadro Kanban robusto com um Timer Pomodoro integrado. O objetivo é permitir que o usuário gerencie tarefas e foco em um único "Cockpit" de produtividade.

## 🛠️ Stack Tecnológica
- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Shadcn/ui
- **Banco de Dados/Auth**: Supabase
- **Gerenciamento de Estado**: 
  - `zustand` (Pomodoro Global)
  - `react-hook-form` + `zod` (Formulários e Validação)
- **Drag & Drop**: `@dnd-kit/core`

---

## 🌟 Funcionalidades Implementadas

### 1. Autenticação e Segurança
- Login integrado com Supabase.
- Rotas protegidas (redirecionamento automático se não autenticado).
- Row Level Security (RLS) garantindo que usuários só vejam seus próprios dados.

### 2. Quadro Kanban (Core)
- **Drag and Drop**: Movimentação suave de tarefas entre colunas (A Fazer, Em Progresso, Concluído).
- **Persistência**: As mudanças de status são salvas automaticamente no servidor.
- **Task Card Otimizado**:
  - Exibe Título, Prioridade, Badge de Categoria.
  - **Fundo Colorido**: Personalizável por tarefa.
  - **Checklist Visível**: Subtarefas aparecem diretamente no card e podem ser marcadas como concluídas sem abrir o modal.
  - **Descrição**: Preview de até 2 linhas.

### 3. Gerenciamento de Tarefas (CRUD Avançado)
- **Criação**: Modal rápido para novas tarefas.
- **Edição (Sheet Lateral)**:
  - Layout compacto e profissional.
  - **Seletor de Cores**: "Pastel Moderno" para diferenciar contextos.
  - **Categorias**: Input com autocomplete (datalist).
  - **Subtarefas**: Adicionar/Remover itens de checklist.
  - **Fallback de Erro**: Sistema inteligente que prevenine inatividade se o banco de dados estiver desatualizado (salva dados parciais e avisa o usuário).
- **Exclusão**: Botão de deletar com confirmação de segurança (Alert Dialog).

### 4. Pomodoro Timer (Cockpit)
- **Barra Lateral Fixa**: Ocupe o lado direito da tela, sempre visível mas não intrusivo.
- **Estado Global (Zustand)**: O timer continua rodando mesmo se você navegar entre rotas ou interagir com o Kanban.
- **Modos de Foco**:
  - 🧠 Foco (25 min)
  - ☕ Pausa Curta (5 min)
  - 🛋️ Pausa Longa (15 min)
- **Feedback Visual/Sonoro**: Barra de progresso, timer gigante e som ao finalizar.

### 5. Celebração 🎉
- **Confete & Som**: Efeitos visuais e sonoros gratificantes ao mover uma tarefa para "Concluído".
- **Visual Dimming**: Tarefas concluídas ficam levemente transparentes e em tons de cinza para foco nas pendências.

---

## 🗄️ Estrutura de Banco de Dados (Schema)

A tabela `tasks` foi extendida para suportar funcionalidades ricas:

```sql
TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo', -- 'todo', 'doing', 'done'
  priority text DEFAULT 'medium', -- 'low', 'medium', 'high'
  due_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Colunas Novas (V2)
  color text DEFAULT 'bg-white dark:bg-slate-950', -- Classes Tailwind
  category text, -- Ex: "Trabalho", "Estudos"
  subtasks jsonb DEFAULT '[]' -- Array de objetos: { id, title, completed }
);

-- Índices
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_category ON public.tasks(category);
```

---

## 🎨 Design System
- **Fonte**: Plus Jakarta Sans (Moderna e Geométrica).
- **Cores**: Paleta Slate (Cinza azulado) para interface e cores Pastel para cards.
- **Componentes**: Baseados em Shadcn/ui (Radix Primitives) para acessibilidade total.

## 🚀 Como Rodar o Projeto

### Opção 1: Script Automático (Recomendado)
Na pasta raiz `organiza_rotina`, basta dar dois cliques no arquivo:
**`iniciar_megafocus.bat`**
Isso abrirá o navegador e iniciará o servidor automaticamente.

### Opção 2: Manualmente
1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env.local` com suas chaves do Supabase.

3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse [http://localhost:3000](http://localhost:3000).
