# 📓 BuJo Focus — Sistema Integrado de Produtividade (Bullet Journal + GTD Digital)

O **BuJo Focus** é uma aplicação web progressiva criada para combinar a simplicidade analógica do **Bullet Journal (BuJo)** com a eficiência do sistema **GTD (Getting Things Done / A Arte de Fazer Acontecer - David Allen)**.

---

## 📌 Sumário
1. [Visão Geral do Projeto](#-visão-geral-do-projeto)
2. [Comandos de Desenvolvimento & Build](#-comandos-de-desenvolvimento--build)
3. [🚀 Planejamento de Novas Features & Roteiro GTD](#-planejamento-de-novas-features--roteiro-gtd)
   - [Dicas de Software GTD (Pág. 383-389 & Apêndice)](#1-dicas-de-ouro-para-softwares-e-ferramentas-digitais-gtd-pág-383-389)
   - [Tabela de Diagnóstico: O que Existe vs. O que Falta](#2-tabela-de-diagnóstico-o-que-existe-vs-o-que-falta-no-bujo-focus)
   - [Roteiro de Evolução por Grau de Importância](#3-roteiro-de-evolução-por-grau-de-importância)
   - [Prompt Mestre para o NotebookLM (Painel Studio)](#4-prompt-mestre-para-o-notebooklm-painel-studio)
4. [📜 Changelog de Releases & Versões Aprovadas](#-changelog-de-releases--versões-aprovadas)

---

## 💻 Comandos de Desenvolvimento & Build

### Servidor Local de Desenvolvimento
```bash
pnpm start   # Ou: npm run start
```
Navegue para `http://localhost:4200/`.

### Build de Produção
```bash
pnpm build   # Ou: npm run build
```
Os arquivos otimizados serão gerados em `dist/frontend/browser/`.

---

## 🚀 Planejamento de Novas Features & Roteiro GTD

### 1. Dicas de Ouro para Softwares e Ferramentas Digitais (GTD Pág. 383-389)
* **Captura sem Fricção (Zero Friction):** O aplicativo deve permitir capturar um pensamento em menos de 2 segundos sem obrigar a escolher data ou projeto na hora.
* **A Agenda é Sagrada (Hard Landscape):** Apenas prazos fatais e compromissos com hora exata pertencem à agenda. Ações do dia a dia pertencem a listas por **Contexto**.
* **Separação entre Projetos e Próximas Ações:** Projetos (resultados com >1 passo) ficam separados. Todo projeto ativo DEVE ter pelo menos 1 próxima ação vinculada no Daily Log.
* **Central de Delegados (`@aguardando`):** Lista única registrando o que foi cobrado de terceiros, com data e nome da pessoa.
* **Incubadora ("Algum Dia / Talvez"):** Lista para ideias futuras (viagens, livros, projetos) para não poluir o dia a dia.
* **Revisão Semanal Guiada:** Ritual de fim de semana para limpar a caixa de entrada e alinhar as metas.

---

### 2. Tabela de Diagnóstico: O que Existe vs. O que Falta no BuJo Focus

| Recurso Recomendado pelo Livro GTD | O que a Funcionalidade faz | Status Atual no BuJo Focus | Ação Recomendada |
| :--- | :--- | :--- | :--- |
| **1. Captura Rápida (Inbox Zero)** | Digitar pendências soltas em 1 clique sem exigir data inicial. | ❌ **Não existe** (Hoje exige data no Daily Log). | 🔴 **Criar Caixa de Entrada Geral** (Atalho `Ctrl+K`). |
| **2. Triagem e Processamento** | Pergunta chave do GTD (*É acionável? < 2 min?*). | 🟡 **Parcial** (Triagem manual). | 🟡 **Criar Assistente de Processamento**. |
| **3. Listas por Contexto** | Organizar ações por `@computador`, `@trabalho`, `@rua`, `@mestrado`. | ✅ **Existe** (Sistema de Tags ativas em `bujo.service.ts`). | 🟢 **Manter e utilizar**. |
| **4. Central de Delegados** | Acompanhar cobranças pendentes com terceiros. | 🟡 **Parcial** (Tag `@aguardando` existe, mas pulverizada). | 🔴 **Criar Painel Centralizado de `@aguardando`**. |
| **5. Rapid Logging (BuJo)** | Marcadores de Tarefas (`•`), Eventos (`O`) e Notas (`-`). | ✅ **Existe** (`Daily Log` em `/daily`). | 🟢 **Manter**. |
| **6. Quadro de Sonhos / Horizontes** | Visão de metas de 1 a 5 anos e propósito de vida. | ✅ **Existe** (`Dream Board` em `/dreams`). | 🟢 **Manter**. |
| **7. Planner Financeiro** | Controle de entradas, saídas e orçamento por dimensão. | ✅ **Existe** (`Planner Financeiro` em `/budget`). | 🟢 **Manter**. |
| **8. Foco na Execução** | Timer Pomodoro ajustável com áudio de foco. | ✅ **Existe** (`Focus Mode` em `/focus`). | 🟢 **Manter**. |
| **9. Exportação para NotebookLM** | Gerador de arquivo `.md` consolidado para o NotebookLM. | ✅ **Existe** (Botão nas Configurações). | 🟢 **Manter**. |
| **10. Preloader Instantâneo** | Loading de 2s com ícone PWA sem distorção e 365 frases. | ✅ **Existe** (`index.html` + `loading-phrases.js`). | 🟢 **Manter**. |
| **11. Migração Diária Guiada** | Perguntar o que fazer com pendências de ontem ao abrir o app. | ❌ **Não existe** (Remarcação manual). | 🟡 **Criar Assistente de Migração Diária**. |
| **12. Revisão Semanal Guiada** | Checklist de 4 passos no fim de semana para organizar a mente. | ❌ **Não existe** (Apenas visão do Weekly Log). | 🟡 **Criar Assistente de Revisão Semanal**. |
| **13. Incubadora "Algum Dia / Talvez"** | Guardar projetos futuros sem poluir o dia a dia. | ❌ **Não existe** (Projetos soltos nas Coleções). | 🟢 **Criar aba Someday/Maybe**. |
| **14. Vínculo Projeto ➔ Ação** | Botão na Coleção para enviar 1 próxima ação ao Daily Log. | ❌ **Não existe** (Coleções isoladas). | 🟢 **Adicionar botão de Próxima Ação nas Coleções**. |
| **15. Matriz de Hábitos Diários** | Régua visual no rodapé do Daily Log para marcação de hábitos. | 🟡 **Parcial** (Dados no backend, falta UI). | 🔴 **Ativar Régua de Hábitos no Daily Log**. |

---

### 3. Roteiro de Evolução por Grau de Importância

* 🔴 **GRAU 1: FUNDAMENTAL (Fazer Primeiro — Máxima Prioridade)**
  1. **Caixa de Entrada Geral (Inbox Zero Unificado):** Botão/Atalho rápido `Ctrl + K` para digitar pendências sem obrigar a escolher data ou contexto.
  2. **Painel Centralizado de "@aguardando" e Delegados:** Tela única exibindo todas as cobranças pendentes com pessoas/instituições.
  3. **Régua Diária de Hábitos (Habit Tracker Matrix):** Exibir no rodapé do Daily Log a marcação em 1 clique dos seus hábitos diários.

* 🟡 **GRAU 2: FLUXO E MANUTENÇÃO (Consistência do Sistema)**
  4. **Assistente de Migração Diária Guiada (Daily Migration):** Modal ao iniciar o dia: `Mover para Hoje`, `Agendar no Future Log` ou `Cancelar`.
  5. **Assistente de Revisão Semanal Guiada (Weekly Review Wizard):** Checklist interativo no sábado/domingo para limpar a Caixa de Entrada e definir as 3 "Big Rocks" da semana.
  6. **Módulo de Tarefas Recorrentes Automáticas:** Repetição programada para compromissos fixos (faturas, relatórios, aulas).

* 🟢 **GRAU 3: MAESTRIA E VISÃO ESTRATÉGICA (Alta Performance)**
  7. **Aba "Algum Dia / Talvez" (Someday / Maybe):** Incubadora de ideias para viagens, livros e projetos futuros sem poluir o dia a dia.
  8. **Próxima Ação Vinculada a Coleções de Projetos:** Botão em cada Coleção para gerar a próxima tarefa acionável direto no Daily Log.
  9. **Filtro de Execução por Energia & Tempo:** Filtrar tarefas por tempo disponível (ex.: 15 min) e nível de energia (baixa/alta).

---

### 4. Prompt Mestre para o NotebookLM (Painel Studio)

```text
Crie um mapa mental detalhado no painel Studio com o tema central "Sistema Integrado de Gestão Pessoal, Acadêmica e Profissional (Bullet Journal + GTD Digital)".

Estruture os ramos do mapa mental utilizando as seguintes orientações e fontes do caderno:

1. TÓPICOS DE FOCO E ESTRUTURA DOS RAMOS:
   - Ramo 1: Horizontes de Foco GTD (David Allen)
     * Propósito e Valores (Dream Board - 50.000 pés)
     * Visão de 3 a 5 anos (Dream Board - 40.000 pés)
     * Metas Estratégicas de 1 a 2 anos (Future Log - 30.000 pés)
     * Áreas de Responsabilidade (Pessoal, Acadêmica, Profissional - 20.000 pés)
     * Projetos Ativos (Coleções - 10.000 pés)
     * Próximas Ações do Dia a Dia (Daily Log - Térreo)

   - Ramo 2: Operação do Bullet Journal (BuJo)
     * Rapid Logging (Tarefas •, Eventos O, Notas -, Prioridades *)
     * Fluxo Diário (Daily Log e Intenção do Dia)
     * Planejamento Temporal (Weekly Log, Monthly Log e Future Log)
     * Regras de Migração e Flexibilidade de Datas
     * Rituais de Revisão (Diária, Semanal e Mensal)

   - Ramo 3: Dicas de Software e GTD Digital (Pág. 383-389)
     * Captura sem Fricção (Caixa de Entrada Geral)
     * A Agenda é Sagrada (Data apenas para prazos exatos)
     * Central de Delegados (@aguardando)
     * Incubadora (Algum Dia / Talvez)
     * Revisão Semanal Guiada como Motor do Sistema

   - Ramo 4: Gestão Financeira e Hábitos
     * Orçamento por Dimensão (Pessoal, Acadêmico, Profissional)
     * Entradas, Saídas e Reservas
     * Matriz de Hábitos Diários (Habit Tracker)

2. NÍVEL DE DETALHAMENTO:
   - Profundo e estruturado, conectando os objetivos de longo prazo às ações diárias do Bullet Journal e organizando o fluxo de revisões sem sobrecarga cognitiva.
```

---

## 📜 Changelog de Releases & Versões Aprovadas

Registro de todas as versões testadas, validadas e aprovadas pelo usuário:

### 🚀 **v1.4.0** — *Preloader Motivacional, Ícone PWA & Limpeza da Codebase* (02/08/2026)
- **Preloader com Frases Motivacionais:** Adicionada tela de carregamento de 2.0s com 365 frases motivacionais de 5 palavras para recepção diária sem FOUC.
- **Ícone Responsivo Sem Distorção:** Renderização otimizada com `<img srcset>` utilizando os ícones PWA nativos (`128x128`, `192x192`, `512x512`).
- **Sincronização com API de Clima:** Preloader aguarda o carregamento dos dados de geolocalização e Open-Meteo com fallback de segurança de 4.0s.
- **Limpeza de Código Legado:** Remoção de 8 arquivos rascunho e assets não utilizados, reduzindo o bundle de CSS em ~36 kB.

### ⚡ **v1.3.1** — *Correção de Exclusão Instantânea do Quadro dos Sonhos* (02/08/2026)
- **Exclusão Instantânea (0ms):** Remoção visual síncrona de itens no `DreamBoardComponent` com disparo imediato de `ChangeDetectorRef`.
- **Prevenção de Ressuscitação de Itens:** Gravação na lixeira (`deletedAt`) e disparo síncrono de `syncLocalToCloud` para garantir que o item permaneça excluído após F5 em produção.

### 🎨 **v1.3.0** — *Ajustes de Layout da Sidebar & Cards do Dashboard* (02/08/2026)
- **Sidebar Sem Scroll Vertical:** Redução de fontes (13.5px) e paddings para caber 100% dos 9 itens na tela do Desktop.
- **Grade de Cards do Dashboard:** Alinhamento dos 8 cards de acesso rápido em **1 linha horizontal no Desktop (`lg:grid-cols-8`)** e **2 linhas no Mobile (`grid-cols-4`)**.

### 🌟 **v1.2.1** — *Hotfix da Sincronização da Lixeira e Exclusão de Tarefas em Nuvem* (02/08/2026)
- **Correção da Flag `allowDeleted`:** Ajuste no `mergeArraysByTimestamp` para que itens deletados na lixeira não sejam descartados durante o merge da nuvem, resolvendo o bug de tarefas excluídas que reapareciam após a sincronização.

### 🏆 **v1.2.0** — *Quadro dos Sonhos (Dream Board CRUD) & Exportador Markdown* (02/08/2026)
- **CRUD do Dream Board:** Módulo completo de Quadro dos Sonhos em `/dreams` (Criar, Editar, Conquistar, Deletar e Filtrar por Categoria).
- **Exportador Markdown para NotebookLM:** Serviço `MarkdownExporterService` e botão em Settings para baixar o contexto consolidado em `.md`.
- **Navegação Integrada:** Aba "Sonhos" na barra lateral e botão de acesso rápido no Dashboard ao lado de Coleções.
