# 📓 BuJo Focus — Produtividade Integrada (Bullet Journal + GTD)

O **BuJo Focus** é uma aplicação web progressiva criada para combinar a simplicidade analógica do **Bullet Journal (BuJo)** com a eficiência inabalável do sistema **GTD (Getting Things Done)**.

---

## 🚀 Funcionalidades (O que o sistema TEM e NÃO TEM)

Abaixo está o status exato das principais mecânicas recomendadas pela metodologia GTD e BuJo dentro do sistema.

### ✅ O que TEMOS implementado:
| Funcionalidade | Descrição |
| :--- | :--- |
| **Captura Rápida (Inbox)** | Atalho universal (`Ctrl+K`) e botão flutuante para capturar ideias em < 2 segundos. |
| **Listas por Contexto (Tags)** | Filtros dinâmicos e organização de ações por `@contexto`. |
| **Central de Delegados** | Aba dedicada (`/waiting`) para gerenciar cobranças de terceiros com badges numéricos. |
| **Rapid Logging (BuJo)** | Diário principal com marcadores (Tarefas, Eventos, Notas). |
| **Régua de Hábitos Diários** | Tracker ultra-compacto no topo do diário com exclusão definitiva e contador de streaks. |
| **Migração Diária Guiada** | Assistente inteligente que identifica tarefas atrasadas e sugere remanejamento em lote. |
| **Revisão Semanal Guiada** | Ritual de 4 passos no fim de semana para Esvaziar Caixa, Cobrar e Definir Big Rocks. |
| **Tarefas Recorrentes** | Agendador autônomo para compromissos fixos (diário, semanal, mensal). |
| **Focus Dashboard (Pomodoro)**| Painel imersivo de Deep Work com "glassmorphism", sincronizado ao relógio atômico. |
| **Quadro de Sonhos (Vision)** | Tela para metas de longo prazo de 1 a 5 anos e propósitos de vida. |
| **Incubadora (Algum Dia/Talvez)**| Gaveta de ideias futuras para não poluir as tarefas do dia a dia. |
| **Planner Financeiro** | Controle integrado de despesas, entradas e orçamento. |
| **Exportação IA (.md)** | Exportação completa do histórico para análise em ferramentas como NotebookLM. |

### ❌ O que NÃO TEMOS (Falta Implementar):
| Funcionalidade | Descrição |
| :--- | :--- |
| **Sub-Tarefas (Gestão de Projetos)** | Atualmente não há aninhamento de sub-tarefas (tarefas-filhas) dentro de uma única tarefa. |
| **Sincronização Offline First** | O sistema depende de rede para a sincronização imediata no Supabase. |
| **Notificações Push Nativas** | Avisos de cronômetro e agenda ainda não disparam Push Notifications reais no SO. |

---

## 💻 Desenvolvimento & Instalação

Este projeto é desenvolvido com Angular + TailwindCSS.

**Pré-requisitos:** Node.js v18+ e PNPM.

### Servidor Local
```bash
pnpm start
```
Navegue para `http://localhost:4200/`.

### Build de Produção
```bash
pnpm build
```
Os arquivos otimizados serão gerados diretamente na pasta `dist/` com CSS do Tailwind pré-compilado.

---

## 📜 Changelog de Releases & Versões Aprovadas

Registro simplificado de todas as melhorias testadas, validadas e aprovadas para o seu dia a dia:

### 🍅 **v2.5.0** — *Focus Dashboard & Pomodoro Momentum Estendido* (11/08/2026)
- **Modo Tela Cheia (Focus Dashboard):** Um painel imersivo de produtividade máxima (`/focus`) projetado com design minimalista de "vidro escuro" (glassmorphism), background de foco e tipografia requintada para sessões de deep work.
- **Integração Completa do Pomodoro e Tarefas:** Acompanha visualmente a tarefa atual em um card flutuante, e permite acessar e concluir a lista completa de tarefas do dia diretamente do painel, com rolagem inteligente e tipografia com serifa em tamanho aprimorado para conforto visual.
- **Relógio de Foco Elegante:** Relógio principal atualizado com ícones dinâmicos monocromáticos sólidos (☀️ de manhã / 🌙 à noite), data amigável em português e sistema de cores imune a distorções.
- **Execução Inteligente de Fundo:** O relógio pomodoro e a contagem de tempo da tarefa ativa continuam processando perfeitamente mesmo se houver navegação para outras funcionalidades ou o navegador perder o foco, usando checagem real de tempo do relógio atômico para zero perda de desempenho.

### 🔘 **v2.3.1** — *Atalhos Rápidos de Acesso ao Gerenciador de Tarefas Recorrentes* (02/08/2026)
- **Botão no Log Diário (`/daily`):** Adicionado o botão `🔄 Recorrentes` ao lado dos controles de navegação de data no diário para abrir instantaneamente o modal de regras.
- **Card nas Configurações (`/settings`):** Adicionado o card temático `🔄 Tarefas Recorrentes Automáticas` com botão `Gerenciar Tarefas Recorrentes`.

### 🔄 **v2.3.0** — *Lançamento do Módulo de Tarefas Recorrentes Automáticas (Grau 2 - Feature 6 / Grau 2 Concluído 100%)* (02/08/2026)
- **Agendamento Recorrente Inteligente (`BujoItem.recurrence`):** Suporte nativo a tarefas com repetição Diária (`daily`), Dias Úteis (`weekdays`), Semanal (`weekly`) e Mensal (`monthly`).
- **Gerenciador de Regras Recorrentes (`RecurringTasksModalComponent`):** Modal dedicado para cadastrar e gerenciar compromissos recorrentes automáticos.
- **Auto-Geração em 1 Clique:** Ao marcar qualquer tarefa recorrente como concluída, o sistema calcula e programa automaticamente a próxima ocorrência para a data futura correspondente.
- **Grau 2 Concluído 100%:** Todas as 3 funcionalidades do Grau 2 (Migração Diária Guiada, Revisão Semanal Guiada e Tarefas Recorrentes Automáticas) foram finalizadas com sucesso!

### 🧹 **v2.2.0** — *Lançamento do Assistente de Revisão Semanal Guiada GTD (Grau 2 - Feature 5)* (02/08/2026)
- **Ritual GTD em 4 Passos (`WeeklyReviewModalComponent`):** Assistente interativo no Log Semanal para conduzir o ritual de fim de semana:
  - **Passo 1 (Get Clear):** Esvaziar e processar a Caixa de Entrada (Inbox Zero).
  - **Passo 2 (Get Current):** Revisar cobranças da Central de Delegados (`@aguardando`).
  - **Passo 3 (Get Strategic):** Revisar diários passados e coleções de projetos.
  - **Passo 4 (Big Rocks):** Formular e salvar as 3 Metas Principais da próxima semana.
- **Persistência de Objetivos:** Armazenamento automático das Big Rocks no `localStorage` para acompanhamento de ritmo.

### ☀️ **v2.1.0** — *Lançamento do Assistente de Migração Diária Guiada (Grau 2 - Feature 4)* (02/08/2026)
- **Detecção Automática de Pendências Passadas:** O Daily Log verifica pendências acumuladas de dias anteriores e exibe um banner de aviso com atalho rápido `☀️ Migrar Agora`.
- **Assistente Interativo de Triagem (`DailyMigrationModalComponent`):** Carrossel guiado para processar pendências anteriores em 1 clique: Mover para Hoje 📌, Agendar Nova Data 📅, Cancelar ❌ ou Manter Assim ⏩.
- **Ação em Lote (Bulk Migration):** Botão `⚡ Mover Todas para Hoje` para migrar todo o acúmulo em menos de 1 segundo.

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
