import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { getLocalDateString } from '../../../../utils/smartParser';
import { SyncStatusService } from '../../../../services/sync-status.service';
import { ModalService } from '../../../../services/modal.service';

@Component({
  selector: 'app-someday-maybe-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './someday-maybe-view.component.html',
  styleUrls: []
})
export class SomedayMaybeViewComponent implements OnInit, OnDestroy {
  somedayItems: BujoItem[] = [];
  newItemContent = '';
  categoryFilter: 'all' | 'projetos' | 'viagens' | 'livros' | 'estudos' | 'outros' = 'all';
  selectedCategory: 'projetos' | 'viagens' | 'livros' | 'estudos' | 'outros' = 'projetos';

  // Schedule modal state
  activeScheduleItemId: string | null = null;
  scheduleDate: string = getLocalDateString(new Date());

  private itemsSub?: Subscription;

  constructor(
    private bujoService: BujoService,
    private syncStatusService: SyncStatusService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.itemsSub = this.bujoService.items$.subscribe(items => {
      this.somedayItems = items.filter(i => 
        (i.date === 'someday' || i.date === 'someday_maybe' || (i as any).isSomeday === true) && 
        i.status !== 'completed' && 
        i.status !== 'cancelled'
      );
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.itemsSub) this.itemsSub.unsubscribe();
  }

  get filteredItems(): BujoItem[] {
    if (this.categoryFilter === 'all') return this.somedayItems;
    return this.somedayItems.filter(item => {
      const cat = (item as any).category || this.detectCategory(item.content);
      return cat === this.categoryFilter;
    });
  }

  detectCategory(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes('viaj') || lower.includes('visitar') || lower.includes('conhecer') || lower.includes('voar')) return 'viagens';
    if (lower.includes('ler') || lower.includes('livro') || lower.includes('ebook') || lower.includes('leitura')) return 'livros';
    if (lower.includes('estudar') || lower.includes('curso') || lower.includes('aprender') || lower.includes('certifica')) return 'estudos';
    if (lower.includes('projeto') || lower.includes('criar') || lower.includes('desenv') || lower.includes('app')) return 'projetos';
    return 'outros';
  }

  getItemCategory(item: BujoItem): string {
    return (item as any).category || this.detectCategory(item.content);
  }

  getItemCategoryBadge(item: BujoItem): { label: string; class: string } {
    const cat = this.getItemCategory(item);
    switch (cat) {
      case 'projetos': return { label: '🚀 Projeto', class: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' };
      case 'viagens': return { label: '✈️ Viagem', class: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' };
      case 'livros': return { label: '📚 Livro', class: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
      case 'estudos': return { label: '🎓 Estudo', class: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' };
      default: return { label: '💡 Ideia', class: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
    }
  }

  addItem(event: Event) {
    event.preventDefault();
    if (!this.newItemContent.trim()) return;

    this.bujoService.addItem({
      content: this.newItemContent.trim(),
      type: 'task',
      status: 'todo',
      date: 'someday',
      category: this.selectedCategory
    } as any);

    this.syncStatusService.showToast({
      type: 'success',
      message: '💡 Ideia adicionada à Incubadora Algum Dia / Talvez!'
    });

    this.newItemContent = '';
  }

  moveToToday(item: BujoItem) {
    const todayStr = getLocalDateString(new Date());
    this.bujoService.updateItem(item.id, {
      date: todayStr,
      isSomeday: false
    } as any);

    this.syncStatusService.showToast({
      type: 'success',
      message: '📌 Ideia ativada e enviada para o Log Diário de Hoje!'
    });
  }

  openScheduleModal(item: BujoItem) {
    this.activeScheduleItemId = item.id;
    this.scheduleDate = getLocalDateString(new Date());
  }

  confirmSchedule(item: BujoItem) {
    if (!this.scheduleDate) return;
    this.bujoService.updateItem(item.id, {
      date: this.scheduleDate,
      isSomeday: false
    } as any);

    this.syncStatusService.showToast({
      type: 'success',
      message: `📅 Ideia agendada para ${this.scheduleDate}!`
    });
    this.activeScheduleItemId = null;
  }

  completeItem(item: BujoItem) {
    this.bujoService.updateItem(item.id, {
      status: 'completed'
    });

    this.syncStatusService.showToast({
      type: 'success',
      message: '✓ Ideia concluída!'
    });
  }

  async deleteItem(item: BujoItem) {
    if (await this.modalService.confirm('Tem certeza que deseja excluir esta ideia da incubadora?', 'Excluir Ideia', 'Excluir', 'Cancelar')) {
      this.bujoService.deleteItem(item.id);
      this.syncStatusService.showToast({
        type: 'offline',
        message: '🗑️ Ideia removida da Incubadora.'
      });
    }
  }
}
