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

Registro simplificado de todas as melhorias testadas, validadas e aprovadas:

- **v2.5.0 (11/08/2026):** 🍅 Lançamento do Focus Dashboard (Pomodoro Imersivo Integrado às Tarefas).
- **v2.3.1 (02/08/2026):** 🔘 Atalhos rápidos para o Gerenciador de Tarefas Recorrentes.
- **v2.3.0 (02/08/2026):** 🔄 Módulo Autônomo de Tarefas Recorrentes (Diário, Úteis, Semanal, Mensal).
- **v2.2.0 (02/08/2026):** 🧹 Assistente Interativo de Revisão Semanal Guiada GTD em 4 passos.
- **v2.1.0 (02/08/2026):** ☀️ Assistente de Migração Diária Guiada (Realocação em lote).
- **v2.0.1 (02/08/2026):** 📐 Alinhamento em linha única da navegação do cabeçalho no mobile.
- **v2.0.0 (02/08/2026):** 🎯 Correção da desmarcação de Hábitos na nuvem.
- **v1.9.9 (02/08/2026):** ↩️ Liberdade de marcação/desmarcação retroativa de Hábitos (qualquer data).
- **v1.9.8 (02/08/2026):** 📱 Modo de Hábitos recolhido por padrão em telas de smartphone.
- **v1.9.7 (02/08/2026):** 🔢 Distintivo de dias totais concluídos (Streak Badge) em cada Hábito.
- **v1.9.6 (02/08/2026):** ⚡ Botão Flutuante (FAB) Universal para Captura Rápida GTD.
- **v1.9.5 (02/08/2026):** 🔄 Sistema robusto de fusão de Hábitos no banco Supabase.
- **v1.9.4 (02/08/2026):** ☁️ Sincronização realtime em nuvem multidevice (Celular e PC).
- **v1.9.3 (02/08/2026):** 🛡️ Filtro anti-ressurreição para Hábitos permanentemente deletados.
- **v1.9.2 (02/08/2026):** 🏷️ Nomenclatura atualizada para "Hábitos Diários".
- **v1.9.1 (02/08/2026):** 👁️ Tooltip de zoom interativo no ícone do olho de Hábitos.
- **v1.9.0 (02/08/2026):** ☕ Estilização requintada da Régua (Marrom Café e Bege Claro).
- **v1.8.9 (02/08/2026):** 🎨 Padronização de fontes de alto contraste em modo Claro e Escuro.
- **v1.8.8 (02/08/2026):** 👁️ Ícone inteligente de Olho Aberto/Fechado.
- **v1.8.7 (02/08/2026):** 🔽 Modo "Retrátil em 1-Toque" para liberar espaço no diário.
- **v1.8.6 (02/08/2026):** 📐 Design de Círculos Ultra-Compactos.
- **v1.8.5 (02/08/2026):** 🔒 Persistência blindada ao excluir Hábitos locais.
- **v1.8.4 (02/08/2026):** 📏 Barra de progresso "Full-Width" na régua superior.
- **v1.8.3 (02/08/2026):** 📊 Barra Dinâmica Pulsante (Vermelho > Amarelo > Verde).
- **v1.8.2 (02/08/2026):** ➕ Botão "+ Novo" pontilhado direto no grid de Hábitos.
- **v1.8.1 (02/08/2026):** ⭕ Régua multi-linha flex com modal de catálogo de ícones (SVG).
- **v1.8.0 (02/08/2026):** ✨ Lançamento do Módulo Tracker Diário de Hábitos.
- **v1.7.0 (02/08/2026):** ⏳ Lançamento do Módulo Central de "@aguardando" e Delegados GTD.
- **v1.6.0 (02/08/2026):** 📥 Lançamento da Captura Rápida Universal Inbox Zero.
- **v1.5.4 (02/08/2026):** 🧹 Ajustes de limpeza no Build e Netlify.
- **v1.5.3 (02/08/2026):** 🎨 Injeção forçada via compilação PostCSS Tailwind.
- **v1.5.2 (02/08/2026):** ⚙️ Atualização radical de cache do Service Worker PWA.
- **v1.5.1 (02/08/2026):** ⚡ Renderização instantânea de pomodoros concluídos na tarefa.
- **v1.5.0 (02/08/2026):** ⏱️ Widget Global lateral de Pomodoro.
- **v1.4.2 (02/08/2026):** ⚙️ Controle rigoroso de cache HTTP em produção.
- **v1.4.1 (02/08/2026):** 👤 Ajuste responsivo do Avatar logado no Celular.
- **v1.4.0 (02/08/2026):** 🚀 Tela motivacional dinâmica e melhoria de ícones PWA.
- **v1.3.1 (02/08/2026):** ⚡ Exclusão sem bugs no Mural de Sonhos.
- **v1.3.0 (02/08/2026):** 🎨 Organização responsiva dos atalhos no Painel Inicial.
- **v1.2.1 (02/08/2026):** 🌟 Correção Anti-ressurreição de tarefas.
- **v1.2.0 (02/08/2026):** 🏆 Lançamento do Módulo Dream Board (Sonhos) e Exportação IA (.md).
