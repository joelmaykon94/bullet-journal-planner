import { Injectable } from '@angular/core';
import { BujoService, BujoItem } from './bujo.service';
import { DreamsService, DreamItem } from '../features/dreams/services/dreams.service';
import { CollectionsService, Collection, CollectionItem, Subtask } from '../features/collections/services/collections.service';

@Injectable({
  providedIn: 'root'
})
export class MarkdownExporterService {
  constructor(
    private bujoService: BujoService,
    private dreamsService: DreamsService,
    private collectionsService: CollectionsService
  ) {}

  public exportContextToMarkdown(): void {
    const markdown = this.generateMarkdownContent();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `bujo_focus_contexto_${dateStr}.md`;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public generateMarkdownContent(): string {
    const now = new Date();
    const timestampStr = now.toLocaleString('pt-BR');
    const items = this.bujoService.getItems().filter(i => !i.deletedAt);
    const dreams: DreamItem[] = (this.dreamsService.dreams || []).filter((d: DreamItem) => !d.deletedAt);
    const collections: Collection[] = (this.collectionsService.collections || []).filter((c: Collection) => !c.deletedAt);
    const habits = this.bujoService.getHabits();
    const tags = this.bujoService.getTags();

    let md = `# 📓 CONTEXTO COMPLETO DO BULLET JOURNAL & GTD (BUJO FOCUS)\n`;
    md += `**Data da Exportação:** ${timestampStr}\n`;
    md += `**Total de Itens Registrados:** ${items.length} itens no log, ${dreams.length} sonhos/metas, ${collections.length} coleções.\n\n`;
    md += `> **Instruções para o NotebookLM:** Utilize as seções abaixo como fontes primárias para responder a dúvidas de rotina, realizar revisões diárias/semanais e estruturar o Mapa Mental no painel Studio.\n\n`;
    md += `---\n\n`;

    // 1. DREAMS & VISÃO DE LONGO PRAZO
    md += `## 🎯 1. VISÃO E METAS DE LONGO PRAZO (DREAM BOARD / NÍVEL 4 & 5 GTD)\n\n`;
    if (dreams.length === 0) {
      md += `*Nenhuma meta cadastrada no Dream Board.*\n\n`;
    } else {
      dreams.forEach((d: DreamItem) => {
        const check = d.conquered ? '[x]' : '[ ]';
        md += `- ${check} **[${d.category || 'Geral'}] ${d.title}**\n`;
        if (d.description) md += `  - *Descrição:* ${d.description}\n`;
      });
      md += `\n`;
    }

    // 2. DAILY & FUTURE LOGS (ITENS)
    md += `## 📅 2. TAREFAS, EVENTOS E NOTAS (DAILY LOG & FUTURE LOG)\n\n`;
    
    const pendingItems = items.filter(i => i.status === 'todo' || i.status === 'in_progress');
    const migratedItems = items.filter(i => i.status === 'migrated' || i.status === 'scheduled');
    const completedItems = items.filter(i => i.status === 'completed');
    const cancelledItems = items.filter(i => i.status === 'cancelled');

    md += `### 🔴 Pendentes e Em Progresso (Próximas Ações - ${pendingItems.length})\n`;
    if (pendingItems.length === 0) {
      md += `*Nenhuma tarefa pendente no momento.*\n\n`;
    } else {
      pendingItems.forEach(i => {
        md += this.formatItemMarkdown(i);
      });
      md += `\n`;
    }

    md += `### 🔄 Migradas e Agendadas (${migratedItems.length})\n`;
    if (migratedItems.length > 0) {
      migratedItems.forEach(i => {
        md += this.formatItemMarkdown(i);
      });
      md += `\n`;
    }

    md += `### ✅ Concluídas Recentemente (${completedItems.length})\n`;
    if (completedItems.length > 0) {
      completedItems.slice(0, 30).forEach(i => {
        md += this.formatItemMarkdown(i);
      });
      if (completedItems.length > 30) {
        md += `*... e mais ${completedItems.length - 30} itens concluídos prévios.*\n`;
      }
      md += `\n`;
    }

    if (cancelledItems.length > 0) {
      md += `### ❌ Canceladas (${cancelledItems.length})\n`;
      cancelledItems.slice(0, 15).forEach(i => {
        md += this.formatItemMarkdown(i);
      });
      md += `\n`;
    }

    // 3. CONTEXTOS GTD & DELEGAÇÕES
    md += `## 🏷️ 3. CONTEXTOS GTD & ITENS DELEGADOS\n\n`;
    
    const delegatedItems = items.filter(i => i.delegatedTo || i.content.toLowerCase().includes('@aguardando'));
    md += `### ⏳ @aguardando / Delegados (${delegatedItems.length})\n`;
    if (delegatedItems.length === 0) {
      md += `*Nenhum item aguardando terceiros.*\n\n`;
    } else {
      delegatedItems.forEach(i => {
        const delegateInfo = i.delegatedTo ? ` (Delegado para: ${i.delegatedTo})` : '';
        md += `- [ ] **${i.content}**${delegateInfo} — Data: ${i.date}\n`;
      });
      md += `\n`;
    }

    md += `### Agrupamento por Contexto (Tags)\n`;
    tags.forEach(tag => {
      const taggedItems = items.filter(i => i.content.toLowerCase().includes(tag.id.toLowerCase()) && i.status !== 'completed');
      if (taggedItems.length > 0) {
        md += `#### ${tag.id} (${taggedItems.length} pendentes)\n`;
        taggedItems.forEach(i => {
          md += `  - ${i.content} [${i.date}]\n`;
        });
      }
    });
    md += `\n`;

    // 4. COLEÇÕES E NOTAS DEDICADAS
    md += `## 📚 4. COLEÇÕES & PROJETOS DEDICADOS\n\n`;
    if (collections.length === 0) {
      md += `*Nenhuma coleção cadastrada.*\n\n`;
    } else {
      collections.forEach((col: Collection) => {
        md += `### 📁 ${col.name}\n`;
        if (col.description) md += `*${col.description}*\n\n`;
        if (col.items && col.items.length > 0) {
          col.items.forEach((ci: CollectionItem) => {
            const check = ci.status === 'done' ? '[x]' : ci.status === 'doing' ? '[/]' : '[ ]';
            md += `- ${check} **${ci.title}**\n`;
            if (ci.notes) md += `  - *Notas:* ${ci.notes}\n`;
            if (ci.subtasks && ci.subtasks.length > 0) {
              ci.subtasks.forEach((st: Subtask) => {
                const stCheck = st.completed ? '[x]' : '[ ]';
                md += `    - ${stCheck} ${st.content}\n`;
              });
            }
          });
        }
        md += `\n`;
      });
    }

    // 5. HÁBITOS
    md += `## 🔁 5. HÁBITOS MONITORADOS\n\n`;
    if (habits.length === 0) {
      md += `*Nenhum hábito cadastrado.*\n\n`;
    } else {
      habits.forEach(h => {
        md += `- 🔹 **${h}**\n`;
      });
      md += `\n`;
    }

    // 6. FINANÇAS (BUDGET)
    md += `## 💰 6. RESUMO FINANCEIRO (BUDGET PLANNER)\n\n`;
    const fixed = this.bujoService.getBudgetFixed();
    const installments = this.bujoService.getBudgetInstallments();
    const debts = this.bujoService.getBudgetDebts();
    const newItemsBudget = this.bujoService.getBudgetNew();

    md += `- **Gastos Fixos Cadastrados:** ${fixed.length}\n`;
    md += `- **Compras Parceladas:** ${installments.length}\n`;
    md += `- **Dívidas / Pendências:** ${debts.length}\n`;
    md += `- **Entradas / Lançamentos Recentes:** ${newItemsBudget.length}\n\n`;

    md += `---\n`;
    md += `*Exportado via BuJo Focus em ${timestampStr}. Pronto para importação no NotebookLM.*\n`;

    return md;
  }

  private formatItemMarkdown(item: BujoItem): string {
    let symbol = '•';
    if (item.type === 'event') symbol = 'O';
    if (item.type === 'note') symbol = '-';

    let statusCheck = '[ ]';
    if (item.status === 'completed') statusCheck = '[x]';
    if (item.status === 'cancelled') statusCheck = '[-]';
    if (item.status === 'migrated' || item.status === 'scheduled') statusCheck = '[>]';

    let line = `- ${statusCheck} **${symbol} ${item.content}**`;

    const metaParts: string[] = [];
    if (item.date) metaParts.push(`Data: ${item.date}`);
    if (item.time) metaParts.push(`Hora: ${item.time}${item.endTime ? '-' + item.endTime : ''}`);
    if (item.priority) metaParts.push(`⭐ Prioridade`);
    if (item.energy) metaParts.push(`Energia: ${item.energy}/5`);
    if (item.complexity) metaParts.push(`Complexidade: ${item.complexity}/5`);
    if (item.delegatedTo) metaParts.push(`Delegado: ${item.delegatedTo}`);

    if (metaParts.length > 0) {
      line += ` *(${metaParts.join(' | ')})*`;
    }
    line += `\n`;

    if (item.description) {
      line += `  - *Detalhes:* ${item.description}\n`;
    }

    if (item.subtasks && item.subtasks.length > 0) {
      item.subtasks.forEach((st: any) => {
        const stCheck = st.completed ? '[x]' : '[ ]';
        line += `    - ${stCheck} ${st.content || st.text || st}\n`;
      });
    }

    return line;
  }
}
