import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, HabitItem } from '../../../../services/bujo.service';
import { SyncStatusService } from '../../../../services/sync-status.service';

export interface AvailableIcon {
  id: string;
  name: string;
  category: string;
  keywords: string;
}

export const AVAILABLE_HABIT_ICONS: AvailableIcon[] = [
  { id: 'droplet', name: 'Água / Copo', category: 'Saúde', keywords: 'água agua copo hidratação beber liquido' },
  { id: 'graduation-cap', name: 'Mestrado / Chapéu', category: 'Estudo', keywords: 'mestrado estudo aula curso faculdade tcc pós graduacao' },
  { id: 'dumbbell', name: 'Musculação / Halter', category: 'Fitness', keywords: 'musculacao musculação braço treino academia exercicio peso' },
  { id: 'car', name: 'Veículo / Óleo', category: 'Rotina', keywords: 'óleo oleo agua água veículo veiculo carro auto motor' },
  { id: 'trash', name: 'Lixeira / Descarte', category: 'Casa', keywords: 'lixo lixeira descarte limpeza casa reciclar' },
  { id: 'pill', name: 'Remédio / Pílula', category: 'Saúde', keywords: 'medicamento remedio remédio pilula pílula saude vitamina' },
  { id: 'book', name: 'Leitura / Livro', category: 'Estudo', keywords: 'leitura livro ler ebook estudar pagina' },
  { id: 'sun', name: 'Sol / Manhã', category: 'Rotina', keywords: 'sol dia manha manhã rotina acorda acordar' },
  { id: 'moon', name: 'Lua / Sono', category: 'Rotina', keywords: 'lua noite sono dormir descanso repouso' },
  { id: 'apple', name: 'Maçã / Dieta', category: 'Saúde', keywords: 'maca maçã dieta alimentacao alimentação fruta comid' },
  { id: 'coffee', name: 'Café / Pausa', category: 'Rotina', keywords: 'cafe café pausa descanso cafeina' },
  { id: 'heart', name: 'Coração / Amor', category: 'Bem-estar', keywords: 'coracao coração saude amor cuidado gratidao' },
  { id: 'footprints', name: 'Caminhada / Passos', category: 'Fitness', keywords: 'caminhada passo passar corrida andar correr' },
  { id: 'bike', name: 'Bicicleta / Ciclismo', category: 'Fitness', keywords: 'bicicleta bike ciclismo pedalar pedal' },
  { id: 'headphones', name: 'Fone / Podcast', category: 'Lazer', keywords: 'fone musica música podcast audio escutar' },
  { id: 'pen', name: 'Caneta / Diário', category: 'Mental', keywords: 'caneta diario diário bujo escrever anotacao redação' },
  { id: 'laptop', name: 'Computador / Trabalho', category: 'Trabalho', keywords: 'notebook pc computador trabalho codigo código estudio' },
  { id: 'wallet', name: 'Carteira / Economia', category: 'Finanças', keywords: 'carteira dinheiro financa finança economizar guardar' },
  { id: 'plant', name: 'Planta / Natureza', category: 'Casa', keywords: 'planta jardim arvore regar natureza verde' },
  { id: 'target', name: 'Alvo / Meta', category: 'Geral', keywords: 'alvo meta objetivo foco conquista' },
  { id: 'zap', name: 'Energia / Foco', category: 'Geral', keywords: 'energia raio foco produtivo agilidade' },
  { id: 'smile', name: 'Humor / Felicidade', category: 'Mental', keywords: 'sorriso humor alegria feliz meditacao meditação' },
  { id: 'shield', name: 'Sem Vício / Proteção', category: 'Saúde', keywords: 'sem vicio escudo disciplina controle' },
  { id: 'award', name: 'Troféu / Prêmio', category: 'Geral', keywords: 'trofeu troféu premio prêmio vitoria meta' }
];

@Component({
  selector: 'app-habit-tracker-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habit-tracker-matrix.component.html',
  styleUrls: []
})
export class HabitTrackerMatrixComponent implements OnInit, OnDestroy {
  @Input() selectedDate: string = '';

  habitItems: HabitItem[] = [];
  availableIcons = AVAILABLE_HABIT_ICONS;

  showAddModal = false;
  isEditMode = false;
  isCollapsed = false;
  newHabitName = '';
  selectedIconId = 'droplet';
  iconSearchQuery = '';

  private habitsSub?: Subscription;
  private logsSub?: Subscription;

  constructor(
    private bujoService: BujoService,
    private syncStatusService: SyncStatusService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.habitsSub = this.bujoService.habits$.subscribe(() => {
      this.habitItems = this.bujoService.getHabitItems();
      this.cdr.markForCheck();
    });

    this.logsSub = this.bujoService.habitLogs$.subscribe(() => {
      this.cdr.markForCheck();
    });

    this.habitItems = this.bujoService.getHabitItems();
  }

  ngOnDestroy() {
    if (this.habitsSub) this.habitsSub.unsubscribe();
    if (this.logsSub) this.logsSub.unsubscribe();
  }

  get filteredIcons(): AvailableIcon[] {
    const query = this.iconSearchQuery.trim().toLowerCase();
    if (!query) return this.availableIcons;
    return this.availableIcons.filter(icon => 
      icon.name.toLowerCase().includes(query) || 
      icon.keywords.toLowerCase().includes(query) ||
      icon.category.toLowerCase().includes(query)
    );
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  openAddModal() {
    this.newHabitName = '';
    this.selectedIconId = 'droplet';
    this.iconSearchQuery = '';
    this.showAddModal = true;
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.isCollapsed = false; // Expand when editing
    }
  }

  selectIcon(iconId: string) {
    this.selectedIconId = iconId;
  }

  isCompleted(habitTitle: string): boolean {
    if (!this.selectedDate) return false;
    return this.bujoService.isHabitCompleted(this.selectedDate, habitTitle);
  }

  toggleHabit(habitTitle: string) {
    if (this.isEditMode) return; // Don't toggle completion when in edit mode
    if (!this.selectedDate) return;
    const isDone = this.bujoService.toggleHabitForDate(this.selectedDate, habitTitle);
    if (isDone) {
      this.syncStatusService.showToast({
        type: 'success',
        message: `✓ Hábito feito: ${habitTitle}!`
      });
    }
  }

  addHabit() {
    const val = this.newHabitName.trim();
    if (!val) return;

    this.bujoService.addHabitItem(val, this.selectedIconId);
    this.syncStatusService.showToast({
      type: 'success',
      message: `✨ Novo hábito cadastrado: ${val}`
    });

    this.newHabitName = '';
    this.showAddModal = false;
  }

  removeHabit(habitItem: HabitItem, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.bujoService.removeHabitItem(habitItem.id);
    this.syncStatusService.showToast({
      type: 'offline',
      message: `🗑️ Hábito "${habitItem.title}" removido da régua.`
    });
  }

  getCompletedCount(): number {
    return this.habitItems.filter(h => this.isCompleted(h.title)).length;
  }

  getCompletionPercentage(): number {
    if (!this.habitItems || this.habitItems.length === 0) return 0;
    return Math.round((this.getCompletedCount() / this.habitItems.length) * 100);
  }

  getProgressBarColorClass(): string {
    const pct = this.getCompletionPercentage();
    if (pct === 0) return 'bg-rose-400 dark:bg-rose-600';
    if (pct <= 33) return 'bg-[#f87171] dark:bg-rose-500';
    if (pct <= 66) return 'bg-[#fbbf24] dark:bg-amber-400';
    return 'bg-[#34d399] dark:bg-emerald-400';
  }
}
