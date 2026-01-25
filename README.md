# 🎯 MegaFocus

> O seu leque de produtividade definitivo. Gerencie tarefas, controle seu tempo e organize sua vida em um único lugar.

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![Release](https://img.shields.io/github/v/release/[SEU-USUARIO]/[NOME-DO-REPO])
![Repo Size](https://img.shields.io/github/repo-size/[SEU-USUARIO]/[NOME-DO-REPO])
![License](https://img.shields.io/badge/License-MIT-purple)

<div style="display: flex; gap: 10px; margin-bottom: 20px;">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css" alt="Tailwind" />
</div>

## 🚀 Visão Geral

O **MegaFocus** resolve o problema da fragmentação de ferramentas. Ao invés de usar um app para listas (ToDo) e outro para timer (Pomodoro), ele integra ambos em uma interface fluida e moderna.

A aplicação utiliza **Next.js 15 (App Router)** para performance máxima e **Supabase** para garantir que seus dados estejam seguros e sincronizados em tempo real.

## ✨ Funcionalidades Principais

### 🧠 Foco & Produtividade (Pomodoro)
* **Timer Global (Zustand):** O cronômetro continua rodando na barra lateral enquanto você navega ou organiza tarefas.
* **Modos Inteligentes:** Ciclos pré-configurados de Foco (25m), Pausa Curta (5m) e Pausa Longa (15m).
* **Feedback Sensorial:** Sons de notificação e barra de progresso visual.

### 📋 Kanban Board (Drag & Drop)
* **Organização Visual:** Arraste tarefas entre colunas (A Fazer, Em Progresso, Concluído) usando `@dnd-kit`.
* **Cards Ricos:** Defina prioridades, cores personalizadas (Pastel Colors) e checklist de subtarefas direto no card.
* **Gamificação:** Efeitos de confete 🎉 ao concluir tarefas para manter a motivação.

### 🔐 Segurança & Nuvem
* **Autenticação Completa:** Login seguro via Email/Senha com confirmação (Magic Link ou Código).
* **Dados Protegidos:** Uso de RLS (Row Level Security) no Supabase — cada usuário acessa apenas o que é seu.

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) |
| **Linguagem** | TypeScript |
| **Estilização** | Tailwind CSS + Shadcn/ui |
| **Backend / DB** | Supabase (PostgreSQL) |
| **Gerência de Estado** | Zustand (Global) + React Query |
| **Validação** | Zod + React Hook Form |
| **Deploy** | Vercel |

---

## 💻 Como Rodar o Projeto (Localmente)

Se você é desenvolvedor e quer contribuir ou testar na sua máquina:

### 1. Clone o repositório
```bash
git clone [https://github.com/](https://github.com/)[SEU-USUARIO]/[NOME-DO-REPO].git
cd [NOME-DO-REPO]

```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install

```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA

```

### 4. Rode o servidor de desenvolvimento

```bash
npm run dev

```

Acesse [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) no seu navegador.

---

## 🗄️ Estrutura do Banco de Dados

<details>
<summary><strong>Ver Schema SQL (Tabela Tasks)</strong></summary>

```sql
create table public.tasks (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id),
  title text not null,
  description text null,
  status text null default 'todo'::text,
  priority text null default 'medium'::text,
  color text null default 'bg-white'::text,
  subtasks jsonb null default '[]'::jsonb,
  created_at timestamp with time zone null default now(),
  constraint tasks_pkey primary key (id)
);

```

</details>

---

## 🤝 Contribuição

Contribuições são bem-vindas! Se você tiver uma ideia para melhorar o MegaFocus:

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/IncrivelFeature`)
3. Faça o Commit (`git commit -m 'Add some IncrivelFeature'`)
4. Faça o Push (`git push origin feature/IncrivelFeature`)
5. Abra um Pull Request

---

Made with 💜 h-vivian1
