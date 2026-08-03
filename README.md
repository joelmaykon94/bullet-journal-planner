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

### 📐 **v2.0.1** — *Alinhamento em Linha Única do Cabeçalho de Data no Mobile* (02/08/2026)
- **Layout Responsivo Único:** A data selecionada, o botão "Hoje" e as setas de navegação (`<` e `>`) agora permanecem alinhados na mesma linha no smartphone.
- **Tipografia Escala Adaptativa:** Aplicada a escala responsiva `text-base sm:text-3xl md:text-4xl` com `truncate` para garantir que a data não quebre em 2 linhas no mobile.

### 🎯 **v2.0.0** — *Correção Crítica: Liberdade Total para Desmarcar Hábitos e Sincronizar na Nuvem* (02/08/2026)
- **Correção no Algoritmo da Nuvem:** Removida a união por Set que re-injetava hábitos desmarcados vindo do Supabase.
- **Desmarcação Instantânea:** Desmarcar um hábito atualiza imediatamente o `localStorage` e substitui o registro do dia na nuvem Supabase, permitindo marcar e desmarcar hábitos quantas vezes quiser sem que o ícone retorne.

### ↩️ **v1.9.9** — *Marcação e Desmarcação Retroativa de Hábitos para Qualquer Data* (02/08/2026)
- **Navegação Histórica de Datas:** Você pode marcar ou desmarcar qualquer hábito em qualquer data (passada, presente ou futura) selecionada no diário.
- **Feedback de Notificação Desmarcado:** Adicionado aviso toast de confirmação `↩ Hábito desmarcado: {nome}` ao alternar hábitos em qualquer dia, atualizando instantaneamente o contador e a nuvem.

### 📱 **v1.9.8** — *Modo Recolhido por Padrão para Hábitos em Telas Mobile* (02/08/2026)
- **Régua Recolhida no Mobile:** Em telas de smartphone (`window.innerWidth < 640px`), os círculos de hábitos iniciam recolhidos (`isCollapsed = true`) por padrão, economizando espaço de tela.
- **Expansão em 1 Toque:** Basta tocar no ícone do olho 👁️ no cabeçalho "Hábitos Diários" para expandir a grade. Em telas de computador, permanece aberto por padrão.

### 🔢 **v1.9.7** — *Distintivo Esquerdo de Total de Dias Concluídos em Cada Hábito* (02/08/2026)
- **Contador Total de Dias Concluídos (Badge Esquerdo):** Adicionado um pequeno círculo numérico no canto superior esquerdo (`-top-1 -left-1`) de cada hábito exibindo o total de dias em que ele foi concluído.
- **Simetria Perfeita:** Espelha o círculo verde com checkmark `✓` do lado direito, proporcionando um feedback imediato do seu streak e consistência de hábitos.

### ⚡ **v1.9.6** — *Captura Rápida Exclusiva via Botão Flutuante Universal (Mobile & Desktop)* (02/08/2026)
- **Remoção da Sidebar:** Removido o botão de Captura Rápida do menu lateral para manter a navegação limpa.
- **Botão Flutuante Universal (FAB):** O botão circular flutuante no canto inferior direito (`bottom-6 right-6`) agora é visível em qualquer tamanho de tela (celular, tablet e computador), com atalho `Ctrl+K` e animação de rotação ao passar o mouse.

### 🔄 **v1.9.5** — *Fusão Inteligente por Data dos Hábitos Concluídos no Supabase* (02/08/2026)
- **União de Logs por Data (`bujo_habit_logs`):** Atualizado o algoritmo de mesclagem na nuvem para realizar a união de arrays de hábitos marcados por data (`Array.from(new Set([...cDateLogs, ...lDateLogs]))`).
- **Zero Sobrescrita entre Dispositivos:** Hábitos marcados localmente são mesclados aos hábitos já salvos na nuvem sem substituir o dia.

### ☁️ **v1.9.4** — *Sincronização Imediata com a Nuvem ao Marcar Hábito* (02/08/2026)
- **Sincronização Cloud em Tempo Real:** Tocar ou clicar para concluir ou desmarcar um hábito salva localmente e spara instantaneamente a sincronização com o banco de dados Supabase na nuvem.
- **Multidispositivos em Sintonia:** Acompanhamento de hábitos atualizado sem atraso em todos os seus celulares, tablets e computadores.

### 🛡️ **v1.9.3** — *Filtro Definitivo Anti-Ressurreição de Hábitos Deletados (`bujo_deleted_habits`)* (02/08/2026)
- **Blacklist de Hábitos Excluídos:** Criado o registro permanente `bujo_deleted_habits` para impedir que hábitos removidos voltem ao sincronizar com a nuvem Supabase ou recarregar a página.
- **Sincronização Dupla `bujo_habits` e `bujo_habit_items`:** Exclusões agora atualizam simultaneamente a lista detalhada e a lista resumida de hábitos no `localStorage`.

### 🏷️ **v1.9.2** — *Atualização do Título para "Hábitos Diários"* (02/08/2026)
- **Título "Hábitos Diários":** Substituído o texto do cabeçalho de "Progresso Diário" por "Hábitos Diários", mantendo a cor marrom café `#4a3b32` e a dica de interação no olho 👁️.

### 👁️ **v1.9.1** — *Ícone do Olho Exclusivo com Dica Interativa de Tooltip* (02/08/2026)
- **Remoção do Texto Rótulo:** Removido o botão de texto "Ocultar"/"Mostrar", deixando o visual da régua minimalista e despoluído.
- **Dica de Interação no Ícone (Tooltip):** Adicionado `title="Clique para ocultar/mostrar hábitos"` e efeito de zoom ao passar o mouse ou tocar no olho.

### ☕ **v1.9.0** — *Título em Marrom Café Escuro `#4a3b32` & Contador em Bege Claro `#7a6656`* (02/08/2026)
- **Título & Olho em Marrom Café `#4a3b32`:** Título "Progresso Diário" e o ícone do Olho 👁️ definidos estritamente na cor nobre `#4a3b32`.
- **Contador em Bege Claro `#7a6656`:** Texto do contador de hábitos e rótulo de estado ("Ocultar"/"Mostrar") ajustados para o tom bege claro suave `#7a6656`.

### 🎨 **v1.8.9** — *Padronização de Fontes e Ícones em Tom Escuro #1c1917* (02/08/2026)
- **Tom Escuro de Alto Contraste (#1c1917):** Substituídas todas as ocorrências de marrom claro/bege desbotado (`#7a6656` / `#afa393`) pelo tom escuro `#1c1917` (em modo claro) e `#f5f5f4` (em modo escuro).
- **Legibilidade Nítida:** Título, contador, ícones de olho, botões `+ Novo` e `Editar`, e rótulos de hábitos agora possuem contraste perfeito em todas as telas.

### 👁️ **v1.8.8** — *Ícone de Olho (Mostrar/Ocultar) & Título em Tom Escuro #1c1917* (02/08/2026)
- **Ícone de Olho Aberto / Fechado (Eye Toggle):** Subtituiu a setinha pelo ícone vetorial de olho 👁️ (olho aberto quando visível e olho cortado quando oculto).
- **Título em Tom Escuro Elegante (`#1c1917`):** Alterada a cor da fonte do título "Progresso Diário" para o tom escuro de alto contraste `#1c1917`, tornando a leitura perfeita em qualquer brilho de tela.

### 🔽 **v1.8.7** — *Modo Retrátil/Collapsible com 1-Toque na Barra de Hábitos* (02/08/2026)
- **Recolher / Expandir com 1-Toque:** Tocar ou clicar na barra de progresso da régua de hábitos recolhe ou expande instantaneamente a lista de círculos.
- **Indicador Visual Chevron (`▼` / `▲`):** Setinha animada indicando o estado atual da régua.
- **Foco Máximo no Log Diário:** No modo recolhido, exibe apenas a barra de progresso em 1 linha, liberando 100% da área da tela para o gerenciamento de tarefas.

### 📐 **v1.8.6** — *Régua de Hábitos Ultra-Compacta (Economia de Espaço Mobile & Desktop)* (02/08/2026)
- **Círculos Ultra-Compactos (`w-9 h-9`):** Diâmetro reduzido para 36px, economizando mais de 40% de altura vertical sem perder legibilidade nem interatividade.
- **Rótulos & Ícones Otimizados (`text-[10px]` & `w-4 h-4`):** Ícones e textos perfeitamente proporcionais para evitar poluição visual em qualquer tamanho de tela.
- **Layout Responsivo Flex-Wrap:** Transição suave e limpa entre linhas em telas pequenas.

### 🔒 **v1.8.5** — *Persistência Definitiva de Deleção de Hábitos* (02/08/2026)
- **Zero Ressurreição de Hábitos Deletados:** Ajustada a flag de inicialização do `BujoService` (`bujo_habits_init_v1`) no `localStorage`.
- **Garantia de Persistência:** Quando um hábito for excluído, essa exclusão é permanente no seu navegador mesmo após recarregar a página com `F5` ou reabrir o aplicativo.

### 📏 **v1.8.4** — *Barra de Progresso Full-Width & Botão Circular de Edição Inline* (02/08/2026)
- **Barra de Progresso 100% Full-Width:** A barra de progresso diário agora se estende por toda a largura superior da régua de hábitos.
- **Botão Circular de Edição Inline (`Editar`):** O botão de editar passou a ser um botão circular (`w-12 h-12`) posicionado diretamente ao lado do botão circular `+ Novo`.

### 📊 **v1.8.3** — *Barra de Progresso Pulsante & Botão Quadrado de Edição Exclusivo* (02/08/2026)
- **Barra de Progresso Dinâmica & Pulsante:** Subtituiu o texto do título por uma barra de progresso no topo da régua que transita do Vermelho Claro (0-33%) -> Amarelo (34-66%) -> Verde Claro (67-100%) à medida que os hábitos são concluídos.
- **Botão de Gerenciamento Quadrado:** Botão compacto e minimalista de edição (`w-9 h-9`).
- **Exclusividade do Ícone de Exclusão:** O ícone vermelho `✕` de remover hábito **NÃO** aparece mais ao passar o mouse. Ele só fica visível quando o modo de edição for ativado no botão quadrado.

### ➕ **v1.8.2** — *Botão Circular + Novo Inline na Régua de Hábitos* (02/08/2026)
- **Botão `+ Novo` em Círculo Inline:** O botão para adicionar novos hábitos agora é exibido como um botão circular pontilhado diretamente após o último hábito adicionado no grid.
- **Harmonia Visual & Usabilidade:** Fluxo de adição contínuo e integrado ao mesmo formato de círculos da régua.

### ⭕ **v1.8.1** — *Régua Circular de Hábitos com Seletor de Ícones & Multi-Linha* (02/08/2026)
- **Botoes Circulares 1-Tap por Hábito:** Exibição em botões circulares com ícones dedicados (Água, Mestrado, Musculação, Óleo/Água, Lixo, Medicamento, etc.).
- **Seletor de Ícones com Busca & Rolagem:** Modal com catálogo de 24 ícones SVG e busca em tempo real para cadastrar novos hábitos.
- **Quebra Automática em Novas Linhas (`flex-wrap`):** Ao cadastrar múltiplos hábitos, a régua gera automaticamente novas linhas organizadas.
- **Modo de Remoção/Gerenciamento:** Botão `✏️ Gerenciar` para remover qualquer hábito da régua em 1-clique.

### ✨ **v1.8.0** — *Recurso 3: Régua Diária de Hábitos (Habit Tracker Matrix)* (02/08/2026)
- **Barra de Hábitos Minimalista no Topo (`HabitTrackerMatrixComponent`):** Posicionada no topo do Log Diário (estilo Streaks e Notion), permitindo a marcação em 1-clique dos hábitos diários sem poluir a lista de tarefas.
- **Micro-Indicadores e Badge de Progresso:** Badge circular com contador de hábitos cumpridos (`3/4`) que fica verde-esmeralda ao atingir 100% de hábitos do dia.
- **Gestão em Tempo Real:** Adição e remoção dinâmica de hábitos personalizados direto na régua.

### ⏳ **v1.7.0** — *Recurso 2: Painel Centralizado de "@aguardando" e Delegados* (02/08/2026)
- **Central de Cobranças (`DelegatesPanelComponent`):** Nova aba dedicada no menu lateral (`Cobranças / Delegados`) com badge dinâmico que agrupa entregas pendentes por responsável ou instituição (`@pessoa`).
- **Ações GTD em 1-Clique:** Botão `🔔 Cobrar Hoje` para enviar lembretes diretos para o Log Diário de Hoje, `✓ Recebido` para concluir entregas e `➕ Nova Cobrança`.
- **Harmonização Estética:** Design em papel bege claro suave (`#faf7f5`) e tinta nanquim sépia (`#382c25`).

### 📥 **v1.6.0** — *Recurso 1: Captura Rápida (Inbox Zero Unificado)* (02/08/2026)
- **Modal Global de Captura Rápida (`Ctrl + K`):** Atalho rápido de altíssima velocidade para registrar tarefas, notas ou eventos a qualquer momento em qualquer tela.
- **Painel & Rota de Triagem da Caixa de Entrada (`inbox-view`):** Tela dedicada com visual de papel bege suave (`#faf7f5`) e tinta sépia nanquim (`#382c25`), incluindo 1-clique GTD triage (`Mover p/ Hoje`, `Agendar`, `Coleção`, `Delegar`, `Algum Dia`).
- **Harmonização Estética & Tipografia:** Texto digitado e títulos no exato tom escuro sépia (`#382c25`), garantindo perfeita legibilidade e alinhamento com a estética do Bullet Journal.

### 🧹 **v1.5.4** — *Alinhamento de Publicação no Netlify e Limpeza de Arquivos Legados no Build* (02/08/2026)
- **Remoção de Arquivos Legados em `dist`:** Adicionada rotina de limpeza automatizada (`rm -rf dist`) que elimina arquivos HTML/CSS antigos residuais que causavam erros 404 em produção.
- **Saída Direta em `dist/`:** Reconfiguração do `outputPath` no `angular.json` e `netlify.toml` para publicar a aplicação Angular diretamente na raiz da pasta `dist/`, eliminando subpastas conflitantes (`dist/frontend/browser`).

### 🎨 **v1.5.3** — *Compilação Prévia do Tailwind CSS e Correção Definitiva de Layout em Produção* (02/08/2026)
- **Pré-compilação do Tailwind CSS (`build-css.mjs`):** Implementada a geração automatizada e completa das utilidades Tailwind v4 via PostCSS antes da execução do Angular CLI.
- **Resolução da Discrepância de Layout (img_2):** Solução para a falha onde o servidor de produção renderizava elementos sem estilos. O bundle final agora contém 100% dos seletores e utilidades CSS compiladas (101 kB), idêntico ao ambiente local.

### ⚙️ **v1.5.2** — *Solução Definitiva para Cache de Estilos CSS e Service Worker em Produção* (02/08/2026)
- **Controle Rigoroso de Cabeçalhos HTTP no Netlify:** Configuração de diretivas `Cache-Control: no-cache, no-store, must-revalidate` em `netlify.toml` para `index.html` e `sw.js`, impedindo que o navegador armazene referências desatualizadas a arquivos CSS antigos.
- **Service Worker v4 (`bujo-focus-cache-v4`):** Atualização do Service Worker para forçar a purga de todas as versões de cache anteriores e proibir o cache do documento HTML principal.
- **Detecção e Atualização Automática no Navegador:** Adicionada verificação de atualização no `main.ts` que recarrega a página automaticamente quando um novo deploy for publicado em produção.

### ⚡ **v1.5.1** — *Sincronização em Tempo Real do Tempo de Foco no Log Diário* (02/08/2026)
- **Atualização Instantânea no Log Diário:** Correção no ciclo de vida dos componentes para renderizar instantaneamente os selos de tempo acumulado (`⏱️`) e pomodoros (`🍅`) nas tarefas do Log Diário/Agenda assim que o timer é pausado, reiniciado, alterado ou finalizado.
- **Selo com Visual Destacado:** Estilização de alto contraste (dourado/âmbar em negrito) garantindo leitura clara e nítida no tema claro e escuro.

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
