# 🚀 Sistema Integrado de Produtividade (Bullet Journal + GTD + NotebookLM)

Este documento reúne a análise completa do seu software atual, o prompt mestre para o **NotebookLM**, o plano de evolução de funcionalidades e a estratégia segura para disponibilização de dados via **Supabase**.

---

## 📌 Sumário
1. [Prompt Mestre para o NotebookLM](#1--prompt-mestre-para-o-notebooklm)
2. [Análise das Funcionalidades Reais do Software Atual](#2--análise-das-funcionalidades-reais-do-software-atual)
3. [Proposta de Novas Funcionalidades Internas (GTD + BuJo)](#3--proposta-de-novas-funcionalidades-internas-gtd--bujo)
4. [Tabela de Limitações e Lacunas do Sistema](#4--tabela-de-limitações-e-lacunas-do-sistema)
5. [Estratégia de Integração Segura de Dados (Supabase ➔ NotebookLM)](#5--estratégia-de-integração-segura-de-dados-supabase--notebooklm)

---

## 1. 📋 Prompt Mestre para o Mapa Mental no NotebookLM (Painel Studio)

Copie e cole o comando abaixo no chat do **NotebookLM** para que ele gere o **Mapa Mental interativo diretamente no seu painel Studio**:

```text
Crie um mapa mental detalhado no painel Studio com o tema central "Sistema Integrado de Gestão Pessoal, Acadêmica e Profissional (Bullet Journal + GTD)".

Estruture os ramos do mapa mental utilizando as seguintes orientações e fontes do caderno:

1. TÓPICOS DE FOCO E ESTRUTURA DOS RAMOS:
   - Ramo 1: Horizontes de Foco GTD
     * Propósito e Valores (Longo Prazo)
     * Visão (3 a 5 anos)
     * Metas Estratégicas (1 a 2 anos - Médio Prazo)
     * Áreas de Responsabilidade (Pessoal, Acadêmica, Profissional)
     * Projetos Ativos
     * Ações Próximas do Dia a Dia (Curto Prazo)

   - Ramo 2: Operação do Bullet Journal (BuJo)
     * Registro Rápido (Tarefas •, Eventos O, Notas -, Prioridades *)
     * Fluxo Diário (Daily Log e Intenção do Dia)
     * Planejamento Temporal (Monthly Log e Future Log)
     * Regras de Migração e Flexibilidade de Reagendamento
     * Rituais de Revisão (Diária, Semanal e Mensal)

   - Ramo 3: Gestão Financeira e Controle
     * Entradas, Saídas e Categorização de Gastos
     * Orçamento por Dimensão (Pessoal, Acadêmico, Profissional)
     * Metas de Reservas e Assinaturas

   - Ramo 4: Dimensões da Rotina
     * Dimensão Pessoal (Saúde, Hábitos, Lazer)
     * Dimensão Acadêmica (Mestrado, Estudos, Prazos)
     * Dimensão Profissional (Projetos, Entregas, Reuniões)

2. NÍVEL DE DETALHAMENTO:
   - Profundo e estruturado, conectando os objetivos de longo prazo às ações diárias do Bullet Journal e organizando o fluxo de revisões e migração de datas.
```

---

## 2. 🔍 Análise das Funcionalidades Reais do Software Atual

Diagnóstico realizado no código-fonte em `src/app/`:

| Módulo / Recurso | Localização no Código | Descrição das Funcionalidades Reais | Alinhamento Metodológico |
| :--- | :--- | :--- | :--- |
| **Daily Log** | `features/daily-log` | Rapid Logging completo com tipos (`task`, `event`, `note`), status (`todo`, `completed`, `cancelled`, `in_progress`, `migrated`, `scheduled`), horários, subtarefas, prioridade (`*`), energia, complexidade e delegação. | **BuJo / GTD (Térreo)** |
| **Logs Visuais** | `features/weekly-log`<br>`features/monthly-log`<br>`features/future-log` | Visualizações temporais para acompanhamento diário/semanal, visão mensal em formato calendário e agendamento futuro para meses posteriores. | **BuJo (Future/Monthly Log)** |
| **Contextos & Tags** | `services/bujo.service.ts` | Sistema de tags pré-configuradas para contextos GTD (`@computador`, `@online`, `@rua`, `@casa`, `@trabalho`, `@mestrado`, `@programando`, `@financeiro`, `@aguardando`, etc.). | **GTD (Contextos & Agendas)** |
| **Modo Foco & Pomodoro** | `features/focus` | Timer Pomodoro ajustável (foco, pausa curta, pausa longa) com controle de áudio, efeitos sonoros e escolha de acompanhante de foco. | **Execução / Foco Diário** |
| **Dream Board** | `features/dreams` | Quadro visual de sonhos, metas de vida e objetivos de longo prazo. | **GTD (Níveis 4 e 5)** |
| **Planner Financeiro** | `features/budget` | Módulo estruturado para gestão de orçamento, controle de gastos e planejamento financeiro. | **BuJo (Coleção Financeira)** |
| **Coleções & Linha do Tempo** | `features/collections`<br>`features/timeline`<br>`features/trash` | Biblioteca de coleções livres para notas/projetos, linha do tempo cronológica e lixeira com recuperação de itens excluídos. | **BuJo (Collections / Index)** |
| **Autenticação & Nuvem** | `services/auth.service.ts`<br>`services/sync-status.service.ts` | Autenticação via Supabase (Magic Link / Google OAuth), persistência na nuvem na tabela `bujo_user_data`, merge inteligente por timestamp e fallback offline no `LocalStorage`. | **Infraestrutura / Persistência** |

---

## 3. 💡 Proposta de Novas Funcionalidades Internas (GTD + BuJo)

Para potencializar o planejamento e a execução dentro da própria ferramenta:

### 📥 A. Caixa de Entrada & Processamento GTD (*In-Basket Wizard*)
* **Como é hoje:** Novas tarefas entram direto com data no Daily Log.
* **Proposta:** Criar um painel de **Caixa de Entrada Geral** para captura rápida de pensamentos e pendências não triadas. Incluir um botão *"Processar Caixa de Entrada"* com o questionário GTD (*"É acionável? -> Próxima Ação, Projeto, Agendado ou Incubadora/Someday"*).

### 🔄 B. Assistente de Migração Guiada (*BuJo Migration*)
* **Como é hoje:** A troca de data/status de migração é feita manualmente item a item.
* **Proposta:** Ao abrir o app ou iniciar um novo dia, exibir um modal leve com as tarefas não concluídas do dia anterior para decisão em lote:
  * `>` Mover para Hoje
  * `<` Agendar no Future Log
  * `*` Marcar Prioridade do Dia
  * `X` Cancelar / Descartar

### 🧹 C. Checklist de Revisão Semanal Guiada (*Weekly Review*)
* **Como é hoje:** Visualização visual no `weekly-log`.
* **Proposta:** Um assistente interativo em 4 passos para rodar no final de semana:
  1. Esvaziar a Caixa de Entrada.
  2. Revisar pendências e conquistas da semana.
  3. Checar o Future Log e o Dream Board.
  4. Selecionar as **3 Grandes Metas (Big Rocks)** da próxima semana.

### 🏷️ D. Visão Centralizada "Aguardando / Delegado"
* **Como é hoje:** O filtro por `@aguardando` depende da navegação entre os dias.
* **Proposta:** Painel único consolidando todas as tarefas com a tag `@aguardando` ou com o campo `delegatedTo` preenchido.

### 📈 E. Rastreador de Hábitos Integrado (Habit Tracker Matrix)
* **Como é hoje:** A estrutura de dados já existe no `BujoService` (`habits$` e `habitLogs$`).
* **Proposta:** Exibir uma régua/matriz diária no rodapé do Daily Log para marcação em 1 clique de hábitos diários (ex.: *Estudo, Exercício, Leitura*).

---

## 4. 📊 Tabela de Limitações e Lacunas do Sistema

O que o sistema (manual ou via app atual sem integrações externas) **não provê nativamente** e como contornar:

| Recurso / Necessidade | O que o Sistema NÃO provê nativamente | Impacto | Solução Sugerida |
| :--- | :--- | :--- | :--- |
| **Notificações Ativas de Horário** | Não dispara alarmes sonoros ou pop-ups no SO fora do navegador aberto. | Risco de perder reuniões com hora exata. | Google Calendar / Apple Calendar para compromissos com hora marcada. |
| **Cálculos Bancários Automáticos** | Não se conecta a APIs bancárias (Open Finance) nem faz conciliação automática. | Exige digitação manual de entradas/saídas. | Planilha dedicada ou módulo de exportação CSV para o `budget`. |
| **Sincronização com o NotebookLM** | O NotebookLM não aceita requisições via webhook/API ativa direta de bancos de dados. | O NotebookLM não atualiza o mapa sozinho sem novos dados. | Gerar exportação em arquivo Markdown (`.md`) no app e subir como fonte no NotebookLM. |
| **Automação de Repetição** | Não recria tarefas recorrentes automaticamente (ex.: "Pagar fatura todo dia 10"). | Necessidade de remarcar tarefas frequentes. | Implementar módulo interno de *Tarefas Recorrentes*. |

---

## 5. 🔒 Estratégia de Integração Segura de Dados (Supabase ➔ NotebookLM)

Como o NotebookLM **não possui integração pública por API/Webhook com bancos de dados**, a forma 100% segura e privada de alimentá-lo é através da **Exportação de Contexto Formatado**:

### Abordagem Recomendada: Botão "Exportar Contexto (.md)" no App

Adicionar no módulo de **Settings** do seu app uma função que lê a base local/Supabase e gera um arquivo `meu_bujo_contexto.md` com a seguinte estrutura limpa:

```markdown
# RELATÓRIO DE CONTEXTO DO SISTEMA (BUJO + GTD)
Data da Exportação: YYYY-MM-DD

## 1. METAS E SONHOS DE LONGO PRAZO (DREAM BOARD)
- [ ] Meta 1...
- [ ] Meta 2...

## 2. PROJETOS ATIVOS E FUTURE LOG
- Projeto Mestrado: ...
- Projeto Trabalho: ...

## 3. TAREFAS PENDENTES POR CONTEXTO (GTD)
### @computador
- [ ] Tarefa A
### @mestrado
- [ ] Tarefa B
### @aguardando
- [ ] Item pendente com fulano

## 4. RESUMO FINANCEIRO DO MÊS
- Orçamento total / Saldo atual
```

#### Benefícios desta Estratégia:
1. **Privacidade Absoluta:** Nenhuma chave de API do Supabase ou senha é exposta.
2. **Compatibilidade Total:** O NotebookLM processa arquivos Markdown com precisão máxima e gera mapas mentais e resumos impecáveis.
3. **Execução Rápida:** Basta 1 clique no app para baixar o arquivo e arrastá-lo para a caixa de fontes do NotebookLM.
