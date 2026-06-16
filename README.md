# BuJo Focus 🧠⚡

O **BuJo Focus** é um planejador cognitivo minimalista e gamificado, estruturado especificamente para pessoas com TDAH e para organização pessoal através da metodologia GTD (*Getting Things Done*). O sistema combina micro-tarefas assistidas por Inteligência Artificial local (Transformers/LLM), monitoramento de energia biológica e gamificação científica para reduzir a carga mental e evitar a paralisia por sobrecarga.

---

## ✨ Principais Funcionalidades

- **Daily Log (Diário de Borda):** Registro rápido de tarefas, eventos e notas com suporte a categorias por emojis, estimativa de tempo e autocompletar inteligente de contextos com `@`.
- **Ritmo Energético (ADHD Energy Chart):** Gráfico de flutuação dopaminérgica diária que sugere os melhores horários para atacar tarefas complexas (Pico de Foco) ou descansar (Vale de Crash).
- **Rastreador de Hábitos (Habit Tracker):** Painel de hábitos para consolidação de rotinas com pontuação visual de consistência.
- **Quadro Someday/Maybe (Algum Dia/Talvez):** Painel interativo estilo *Sticky Notes* para descarregar ideias e projetos futuros divididos em categorias.
- **Central de Foco & User Persona:** Acompanhamento de Nível de Experiência (XP), Nível de Ansiedade e indicador de Carga Cognitiva em tempo real.
- **Tema Premium Hashira (Demon Slayer):** Customização visual inspirada no anime Demon Slayer com trilha sonora de ambiente e companheiro de foco selecionável.

---

## 🛠️ Pré-requisitos

Para rodar o projeto localmente, certifique-se de ter instalado em sua máquina:

1. **Node.js** (versão 18.0.0 ou superior recomendada)
2. **Gerenciador de Pacotes:** `pnpm` (recomendado) ou `npm`

---

## 🚀 Como Executar Localmente

### Passo 1: Clonar o Repositório e Instalar Dependências
No seu terminal, clone o projeto e acesse a pasta raiz:
```bash
git clone <url-do-repositorio>
cd bullet-journal-planner
```

Instale as dependências usando o `pnpm` (ou `npm`):
```bash
pnpm install
# ou caso use npm:
npm install
```

### Passo 2: Configurar Variáveis de Ambiente
1. Copie o arquivo de exemplo [.env.example](./.env.example):
   ```bash
   cp .env.example .env
   ```
2. Abra o arquivo `.env` gerado e configure suas chaves do Supabase:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Chave pública anônima do seu projeto.

### Passo 3: Iniciar o Servidor de Desenvolvimento
Inicie o servidor local:
```bash
pnpm run dev
# ou caso use npm:
npm run dev
```

Abra o seu navegador no endereço indicado (geralmente [http://localhost:5173](http://localhost:5173)) para começar a usar a plataforma.

---

## 💾 Integração com Supabase (Banco de Dados)

O BuJo Focus utiliza o **Supabase** como backend para persistência segura dos logs, hábitos, coleções e progresso do usuário. Se as chaves do Supabase não forem fornecidas no `.env`, o aplicativo executará no **Modo Offline** utilizando o `localStorage` do navegador como fallback automático.

### Estrutura do Banco de Dados
Para habilitar a persistência em nuvem, você deve ter as tabelas mapeadas no Supabase de acordo com o esquema definido no contexto do aplicativo (veja [BujoContext.tsx](./src/context/BujoContext.tsx)).

---

## 🌐 Deploy em Produção (Netlify)

Para hospedar e publicar o projeto de forma contínua a partir de commits no GitHub, consulte o nosso guia detalhado de deploy:

- [Manual de Deploy no Netlify](./docs/deploy-netlify.md)
