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

## 📜 Histórico Recente de Versões
- **v2.5.0**: Lançamento do Focus Dashboard Imersivo (Pomodoro com integração à tarefa atual).
- **v2.3.0**: Módulo Autônomo de Tarefas Recorrentes.
- **v2.2.0**: Assistente Interativo de Revisão Semanal Guiada GTD.
- **v2.1.0**: Sistema Inteligente de Migração Diária Guiada em lote.
- **v1.9.0**: Régua de Hábitos (Habit Tracker Matrix) com Sync Realtime Cloud.

*(Consulte a aba de Releases do repositório para o histórico longo detalhado).*
