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

Registro simplificado de todas as melhorias testadas, validadas e aprovadas para o seu dia a dia:

### ⏱️ **v1.5.0** — *Widget Global de Pomodoro no Menu Lateral & Cronometragem Ativa de Tarefas* (02/08/2026)
- **Pomodoro Global Integrado:** Novo widget visual de Pomodoro posicionado no menu lateral (entre Sonhos e Perfil do Usuário), acessível e ativo independentemente da página em navegação.
- **Associação de Tarefas e Cronometragem Ativa:** Escolha interativa de tarefas do Daily Log via seletor flutuante com busca ao vivo (`🔍`), contabilizando automaticamente segundos ativos `(⏱️)` e ciclos concluídos `(🍅)` na tarefa.
- **Controles e Modais no Estilo Dark Premium:** Botões de Start, Pause, Reset, minimização em 1 clique e modal de configurações de tempo (Foco, Pausas curtas/longas).
- **Exibição dos Selos no Daily Log:** Exibição imediata de selos dourados de tempo dedicado e pomodoros acumulados nas tarefas do Daily Log.

### ⚙️ **v1.4.2** — *Correção de Cache do Service Worker e Sincronização de Estilos CSS* (02/08/2026)
- **Atualização Instantânea de Estilos em Produção:** Atualizado o Service Worker (`bujo-focus-cache-v3`) para forçar a limpeza automática de arquivos CSS antigos em cache e garantir que o novo visual seja carregado imediatamente em produção.
- **Sincronização de Versões:** Alinhamento da geração automática do código de versão para evitar divergências entre o ambiente local e a produção.

### 👤 **v1.4.1** — *Correção do Nome de Usuário e Avatar no Celular* (02/08/2026)
- **Avatar e Nome no Celular:** O menu mobile agora exibe a letra inicial correta do avatar e o nome amigável do usuário (extraído do Google OAuth via Supabase ou formatado a partir do e-mail), alinhando o cabeçalho mobile perfeitamente com o computador.

### 🚀 **v1.4.0** — *Tela de Recepção Motivacional, Ícones Nítidos e Melhoria de Desempenho* (02/08/2026)
- **Tela de Boas-Vindas Motivacional:** Adicionada uma tela inicial de carregamento de 2 segundos que sorteia uma entre 365 frases motivacionais curtas para inspirar o seu dia a cada atualização.
- **Ícone Nítido em Qualquer Tela:** O ícone do aplicativo agora se ajusta automaticamente a computadores, celulares e telas de alta resolução sem ficar esticado ou borrado.
- **Carregamento Inteligente do Clima:** A tela inicial aguarda o carregamento das informações do tempo e da sua cidade para o aplicativo abrir totalmente pronto para uso.
- **Navegação Mais Leve e Rápida:** Limpeza interna no sistema que deixou o aplicativo mais leve e rápido para carregar.

### ⚡ **v1.3.1** — *Exclusão Instantânea no Quadro dos Sonhos* (02/08/2026)
- **Exclusão Instantânea de Sonhos:** Ao apagar uma meta ou sonho no Quadro dos Sonhos, o item desaparece da tela no mesmo instante sem nenhum travamento.
- **Garantia de Remoção Permanente:** Corrigido o comportamento em que um sonho excluído voltava a aparecer na tela ao recarregar a página (F5) ou ao sincronizar com a nuvem.

### 🎨 **v1.3.0** — *Ajustes de Layout no Menu Lateral e no Painel Inicial* (02/08/2026)
- **Menu Lateral Ajustado:** Todos os itens do menu lateral agora cabem perfeitamente na tela do computador sem precisar rolar a página para baixo.
- **Painel Inicial Mais Organizado:** No computador, os botões de acesso rápido ficam alinhados em uma única linha horizontal elegante. No celular, ficam organizados em duas linhas de fácil toque.

### 🌟 **v1.2.1** — *Correção na Sincronização de Tarefas Excluídas* (02/08/2026)
- **Sincronização Confiável da Lixeira:** Resolvido o problema em que tarefas apagadas no aplicativo voltavam a aparecer na lista ao sincronizar com a nuvem ou ao acessar em outro dispositivo.

### 🏆 **v1.2.0** — *Quadro dos Sonhos (Dream Board) e Exportação para Inteligência Artificial* (02/08/2026)
- **Quadro dos Sonhos (Dream Board):** Novo espaço exclusivo para cadastrar, editar, organizar por categorias e marcar como "Conquistado" todos os seus sonhos e objetivos de longo prazo.
- **Exportação de Dados para Inteligência Artificial:** Botão nas Configurações que permite baixar todo o histórico e planejamento do seu aplicativo em formato texto (`.md`) para enviar ao NotebookLM ou a outras ferramentas de IA.
- **Acesso Rápido Facilitado:** Novo botão "Sonhos" inserido no menu principal e no painel inicial do sistema.
