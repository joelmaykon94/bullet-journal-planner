import { Component, OnInit, OnDestroy, ViewEncapsulation, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { getLocalDateString } from '../../../../utils/smartParser';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col max-w-4xl mx-auto w-full pb-20 animate-fade-in">
      
      <!-- Cabeçalho & Navegação de Dias -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-stone-800 pb-4 mb-6 gap-4">
        <div>
          <h1 class="text-3xl sm:text-4xl font-serif text-stone-900 font-bold italic tracking-tight">Agenda Diária</h1>
          <p class="text-sm text-stone-500 font-mono mt-1 uppercase tracking-widest">Controle de Horários</p>
        </div>
        
        <div class="flex items-center gap-2 bg-stone-100 p-1 rounded border border-stone-200 shadow-sm self-start sm:self-auto">
          <button (click)="changeDay(-1)" class="p-1.5 rounded hover:bg-stone-200 transition-colors text-stone-600" title="Dia Anterior">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span class="text-xs font-mono font-bold px-3 text-stone-800">
            {{ displayDate }}
          </span>
          <button (click)="changeDay(1)" class="p-1.5 rounded hover:bg-stone-200 transition-colors text-stone-600" title="Próximo Dia">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <!-- Abas Mobile -->
      <div class="flex bg-stone-100 p-1 rounded border border-stone-200 lg:hidden mb-4">
        <button (click)="mobileView = 'timeline'" 
                [class.bg-stone-800]="mobileView === 'timeline'" [class.text-stone-100]="mobileView === 'timeline'"
                [class.text-stone-500]="mobileView !== 'timeline'"
                class="flex-1 py-2 rounded text-xs font-bold transition-all uppercase tracking-widest">
          Timeline
        </button>
        <button (click)="mobileView = 'unscheduled'" 
                [class.bg-stone-800]="mobileView === 'unscheduled'" [class.text-stone-100]="mobileView === 'unscheduled'"
                [class.text-stone-500]="mobileView !== 'unscheduled'"
                class="flex-1 py-2 rounded text-xs font-bold transition-all uppercase tracking-widest">
          Pendentes ({{ unscheduledTasks.length }})
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        
        <!-- Timeline (Lado Esquerdo) -->
        <div class="lg:col-span-2 space-y-2 relative" [class.hidden]="mobileView !== 'timeline' && isMobile()">
          
          <div *ngFor="let hour of hours; let i = index" 
               class="flex items-start gap-4 p-3 rounded border transition-all relative group"
               [class.bg-stone-100]="!isCurrentHour(hour)"
               [class.border-stone-200]="!isCurrentHour(hour)"
               [class.bg-amber-50]="isCurrentHour(hour)"
               [class.border-amber-200]="isCurrentHour(hour)"
               (dragover)="onDragOver($event)"
               (drop)="onDrop($event, hour.value)">
               
            <!-- Indicador de Hora Atual (Linha) -->
            <div *ngIf="isCurrentHour(hour)" 
                 class="absolute left-0 right-0 h-0.5 bg-amber-500 z-10 pointer-events-none opacity-50"
                 [style.top.%]="nowMinutesPercent">
              <span class="absolute right-2 -top-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono shadow-sm">
                AGORA
              </span>
            </div>
            
            <div class="text-xs font-mono w-12 pt-1" 
                 [class.text-amber-700]="isCurrentHour(hour)" 
                 [class.font-bold]="isCurrentHour(hour)"
                 [class.text-stone-400]="!isCurrentHour(hour)">
              {{ hour.display }}
            </div>
            
            <div class="flex-1 min-w-0 min-h-[40px] flex flex-col gap-2">
              
              <div *ngFor="let item of getItemsForHour(hour.value)" 
                   draggable="true"
                   (dragstart)="onDragStart($event, item.id)"
                   class="flex items-center justify-between p-2 rounded border shadow-sm text-sm cursor-grab active:cursor-grabbing transition-all bg-white hover:bg-stone-50 w-full max-w-full overflow-hidden"
                   [class.opacity-50]="item.status === 'completed'"
                   [class.line-through]="item.status === 'completed'">
                <div class="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                  <button (click)="toggleStatus(item)" class="text-stone-400 hover:text-stone-800 flex-shrink-0 font-mono font-bold w-5 h-5 flex items-center justify-center bujo-tooltip"
                          [attr.data-tooltip]="getStatusTooltip(item)">
                    {{ getSymbol(item) }}
                  </button>
                  <span class="text-stone-800 truncate font-sans flex-1 min-w-0" [title]="item.content">{{ item.content }}</span>
                </div>
                <button (click)="removeItemTime(item.id)" class="text-stone-300 hover:text-red-500 flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity bujo-tooltip" data-tooltip="Remover horário">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              
              <div *ngIf="getItemsForHour(hour.value).length === 0" class="text-xs text-stone-300 italic py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Arraste tarefas para cá...
              </div>

            </div>
          </div>
        </div>

        <!-- Pendentes (Lado Direito) -->
        <div class="lg:col-span-1" [class.hidden]="mobileView !== 'unscheduled' && isMobile()">
          <div class="sticky top-20 bg-stone-100 border border-stone-200 rounded p-4 shadow-sm">
            <h3 class="text-sm font-bold font-serif italic text-stone-800 mb-4 border-b border-stone-200 pb-2">Tarefas sem horário</h3>
            
            <div class="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-2 content-scroll">
              <div *ngFor="let item of unscheduledTasks"
                   draggable="true"
                   (dragstart)="onDragStart($event, item.id)"
                   class="bg-white p-3 rounded border border-stone-200 shadow-sm cursor-grab active:cursor-grabbing hover:bg-stone-50 transition-colors text-sm text-stone-700 flex items-start gap-2">
                <span class="text-stone-400 font-mono mt-0.5 flex-shrink-0">•</span>
                <span class="leading-snug truncate flex-1 min-w-0" [title]="item.content">{{ item.content }}</span>
              </div>
              
              <div *ngIf="unscheduledTasks.length === 0" class="text-sm text-stone-400 italic text-center py-8">
                Nenhuma tarefa pendente sem horário para hoje.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class TimelineComponent implements OnInit, OnDestroy {
  items: BujoItem[] = [];
  selectedDate: string = '';
  mobileView: 'timeline' | 'unscheduled' = 'timeline';
  
  now = new Date();
  private timer?: any;
  private sub?: Subscription;
  private dateSub?: Subscription;
  
  // Create hours array from 05:00 to 23:00
  hours = Array.from({ length: 19 }, (_, i) => {
    const h = i + 5;
    return {
      value: h,
      display: h.toString().padStart(2, '0') + ':00'
    };
  });

  constructor(private bujoService: BujoService) {}

  ngOnInit() {
    this.sub = this.bujoService.items$.subscribe(items => {
      this.items = items;
    });
    this.dateSub = this.bujoService.selectedDate$.subscribe(date => {
      this.selectedDate = date;
    });
    
    this.timer = setInterval(() => {
      this.now = new Date();
    }, 15000);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.dateSub) this.dateSub.unsubscribe();
    if (this.timer) clearInterval(this.timer);
  }

  get displayDate(): string {
    if (!this.selectedDate) return '';
    const parts = this.selectedDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return this.selectedDate;
  }

  changeDay(delta: number) {
    if (!this.selectedDate) return;
    const d = new Date(this.selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    this.bujoService.setSelectedDate(getLocalDateString(d));
  }

  isCurrentHour(hour: { value: number, display: string }): boolean {
    const todayStr = getLocalDateString();
    if (this.selectedDate !== todayStr) return false;
    return this.now.getHours() === hour.value;
  }

  get nowMinutesPercent(): number {
    return (this.now.getMinutes() / 60) * 100;
  }

  isMobile(): boolean {
    return window.innerWidth < 1024;
  }

  @HostListener('window:resize')
  onResize() {
    // Just trigger change detection for isMobile()
  }

  get dayItems(): BujoItem[] {
    return this.items.filter(i => i.date === this.selectedDate && i.status !== 'cancelled');
  }

  getItemsForHour(hourNum: number): BujoItem[] {
    return this.dayItems.filter(item => {
      if (!item.time) return false;
      const h = parseInt(item.time.split(':')[0], 10);
      return h === hourNum;
    });
  }

  get unscheduledTasks(): BujoItem[] {
    return this.dayItems.filter(item => !item.time);
  }

  // Drag and Drop
  onDragStart(event: DragEvent, itemId: string) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', itemId);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, targetHourNum: number) {
    event.preventDefault();
    const itemId = event.dataTransfer?.getData('text/plain');
    if (itemId) {
      this.assignItemToTime(itemId, targetHourNum.toString().padStart(2, '0') + ':00');
    }
  }

  assignItemToTime(id: string, timeStr: string) {
    this.bujoService.updateItem(id, { time: timeStr });
  }

  removeItemTime(id: string) {
    // In Angular/TS to remove a key we might need to set it to undefined or empty string.
    // Setting to empty string works well with truthiness checks.
    this.bujoService.updateItem(id, { time: '' });
  }

  getSymbol(item: BujoItem): string {
    if (item.status === 'completed') return 'X';
    if (item.status === 'cancelled') return '—';
    if (item.status === 'migrated') return '>';
    if (item.status === 'scheduled') return '<';
    if (item.type === 'event') return 'o';
    if (item.type === 'note') return '-';
    return '•'; // todo / default
  }

  getStatusTooltip(item: BujoItem): string {
    if (item.type === 'event') return 'Evento';
    if (item.type === 'note') return 'Nota';
    
    switch (item.status) {
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'in_progress': return 'Em andamento';
      case 'migrated': return 'Migrada';
      case 'scheduled': return 'Antecipada';
      case 'todo':
      default: return 'Pendente';
    }
  }

  toggleStatus(item: BujoItem) {
    if (item.type !== 'task') return;
    let newStatus = item.status;
    if (item.status === 'todo') newStatus = 'completed';
    else if (item.status === 'completed') newStatus = 'todo';
    this.bujoService.updateItem(item.id, { status: newStatus });
  }
}
