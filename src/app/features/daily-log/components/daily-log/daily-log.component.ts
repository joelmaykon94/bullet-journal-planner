import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { parseSmartTask, getLocalDateString } from '../../../../utils/smartParser';
import { BulletItemComponent } from '../bullet-item/bullet-item.component';

@Component({
  selector: 'app-daily-log',
  standalone: true,
  imports: [CommonModule, FormsModule, BulletItemComponent],
  styles: [`
    :host {
      display: block;
      height: calc(100% + 40px); /* 20px top/bottom no mobile */
      margin-top: -20px;
      margin-bottom: -20px;
      overflow-x: hidden;
    }
    @media (min-width: 640px) {
      :host {
        height: calc(100% + 64px); /* 32px top/bottom no desktop */
        margin-top: -32px;
        margin-bottom: -32px;
      }
    }
    .page-turning-wrapper {
      perspective: 2500px;
      width: calc(100% - 4px); /* Compensa sombra de 4px na direita do 3D volume */
      height: 100%;
      transform-style: preserve-3d;
      margin-right: 4px;
    }
    .page-3d-volume {
      transform-style: preserve-3d;
      position: relative;
      /* Simula espessura de bloco de folhas */
      box-shadow: 
        1px 0 0 rgba(0,0,0,0.03),
        2px 0 0 rgba(0,0,0,0.03),
        3px 0 0 var(--color-paper-bg),
        4px 0 0 rgba(0,0,0,0.08),
        inset 8px 0 16px rgba(0,0,0,0.02);
      border-radius: 0 4px 4px 0;
      background: var(--color-paper-bg);
      min-height: 100%;
    }
    .page-3d-volume::before {
      /* Lombada / vinco do caderno */
      content: '';
      position: absolute;
      top: 0; bottom: 0; left: 0;
      width: 35px;
      background: linear-gradient(to right, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.02) 40%, transparent 100%);
      pointer-events: none;
      z-index: 50;
    }
    .turn-page-forward {
      animation: flipNextReal 0.55s ease-in-out forwards;
      transform-origin: 0% 50%;
    }
    .turn-page-forward-alt {
      animation: flipNextRealAlt 0.55s ease-in-out forwards;
      transform-origin: 0% 50%;
    }
    .turn-page-backward {
      animation: flipPrevReal 0.55s ease-in-out forwards;
      transform-origin: 0% 50%;
    }
    .turn-page-backward-alt {
      animation: flipPrevRealAlt 0.55s ease-in-out forwards;
      transform-origin: 0% 50%;
    }
    
    @keyframes flipNextReal {
      0% { transform: perspective(2500px) rotateY(0deg) skewY(0deg); box-shadow: inset 0 0 0 rgba(0,0,0,0); opacity: 1; }
      25% { transform: perspective(2500px) rotateY(-35deg) skewY(-1deg); box-shadow: inset 150px 0 50px -50px rgba(0,0,0,0.15); }
      49% { transform: perspective(2500px) rotateY(-90deg) skewY(0deg); box-shadow: inset 400px 0 100px -50px rgba(0,0,0,0.3); opacity: 0; }
      51% { transform: perspective(2500px) rotateY(90deg) skewY(0deg); opacity: 0; }
      100% { transform: perspective(2500px) rotateY(0deg) skewY(0deg); box-shadow: inset 0 0 0 rgba(0,0,0,0); opacity: 1; }
    }
    @keyframes flipNextRealAlt {
      0% { transform: perspective(2500px) rotateY(0deg) skewY(0deg); box-shadow: inset 0 0 0 rgba(0,0,0,0); opacity: 1; }
      25% { transform: perspective(2500px) rotateY(-35deg) skewY(-1deg); box-shadow: inset 150px 0 50px -50px rgba(0,0,0,0.15); }
      49% { transform: perspective(2500px) rotateY(-90deg) skewY(0deg); box-shadow: inset 400px 0 100px -50px rgba(0,0,0,0.3); opacity: 0; }
      51% { transform: perspective(2500px) rotateY(90deg) skewY(0deg); opacity: 0; }
      100% { transform: perspective(2500px) rotateY(0deg) skewY(0deg); box-shadow: inset 0 0 0 rgba(0,0,0,0); opacity: 1; }
    }
    
    @keyframes flipPrevReal {
      0% { transform: perspective(2500px) rotateY(0deg) skewY(0deg); box-shadow: inset 0 0 0 rgba(0,0,0,0); opacity: 1; }
      49% { transform: perspective(2500px) rotateY(90deg) skewY(0deg); opacity: 0; }
      51% { transform: perspective(2500px) rotateY(-90deg) skewY(0deg); box-shadow: inset 400px 0 100px -50px rgba(0,0,0,0.3); opacity: 0; }
      75% { transform: perspective(2500px) rotateY(-35deg) skewY(1deg); box-shadow: inset 150px 0 50px -50px rgba(0,0,0,0.15); opacity: 1; }
      100% { transform: perspective(2500px) rotateY(0deg) skewY(0deg); box-shadow: inset 0 0 0 rgba(0,0,0,0); opacity: 1; }
    }
    @keyframes flipPrevRealAlt {
      0% { transform: perspective(2500px) rotateY(0deg) skewY(0deg); box-shadow: inset 0 0 0 rgba(0,0,0,0); opacity: 1; }
      49% { transform: perspective(2500px) rotateY(90deg) skewY(0deg); opacity: 0; }
      51% { transform: perspective(2500px) rotateY(-90deg) skewY(0deg); box-shadow: inset 400px 0 100px -50px rgba(0,0,0,0.3); opacity: 0; }
      75% { transform: perspective(2500px) rotateY(-35deg) skewY(1deg); box-shadow: inset 150px 0 50px -50px rgba(0,0,0,0.15); opacity: 1; }
      100% { transform: perspective(2500px) rotateY(0deg) skewY(0deg); box-shadow: inset 0 0 0 rgba(0,0,0,0); opacity: 1; }
    }
  `],
  template: `
    <div class="page-turning-wrapper">
      <div class="flex flex-col max-w-3xl mx-auto w-full pb-20 page-3d-volume" [ngClass]="pageTurnClass">
      
      <!-- Cabeçalho de Data e Rapid Logging Sticky Wrapper -->
      <!-- Adicionado padding top extra (pt-8/sm:pt-10) para o conteúdo interno não colar no teto após as margens negativas -->
      <div class="sticky top-0 z-20 pt-8 sm:pt-10 pb-2 mb-6" style="background: var(--color-paper-bg);">
        
        <div class="rounded-none border border-stone-300 bg-white shadow-[8px_8px_0px_rgba(41,37,36,0.1)] p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 relative transition-colors focus-within:border-stone-800">
          
          <!-- Cabeçalho de Data -->
          <div class="border-b border-stone-200 pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
            <div>
              <h1 class="text-2xl sm:text-4xl font-serif text-stone-900 font-bold italic tracking-tight">{{ formattedSelectedDate }}</h1>
              <p class="text-xs sm:text-sm text-stone-500 font-mono mt-1 uppercase tracking-widest">
                Log Diário <span class="text-[10px] sm:text-xs text-stone-400 lowercase ml-1 normal-case">({{ dayOfWeek }})</span>
              </p>
            </div>
            
            <!-- Controles de data -->
            <div class="flex items-center gap-1 sm:gap-2 self-start sm:self-auto">
              <button (click)="changeDay(-1)" class="p-1.5 sm:p-2 hover:bg-stone-100 rounded transition-colors text-stone-600 bujo-tooltip" data-tooltip="Dia Anterior">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button (click)="goToToday()" class="px-2 sm:px-3 py-1 sm:py-1.5 font-mono text-xs sm:text-sm uppercase tracking-wider bg-stone-50 hover:bg-stone-100 text-stone-800 rounded border border-stone-300 transition-colors">
                Hoje
              </button>
              <button (click)="changeDay(1)" class="p-1.5 sm:p-2 hover:bg-stone-100 rounded transition-colors text-stone-600 bujo-tooltip" data-tooltip="Próximo Dia">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          <!-- Rapid Logging Input -->
          <form (submit)="handleAddItem($event)" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            
            <div class="flex flex-1 items-center gap-2 bg-stone-50 sm:bg-transparent rounded-lg border border-stone-200 sm:border-none p-1 sm:p-0 focus-within:border-stone-400">
              <div class="relative group shrink-0">
                <select [(ngModel)]="newItemType" name="type" class="appearance-none bg-stone-100 sm:bg-stone-100 border-none sm:border sm:border-stone-200 rounded px-2 py-2 sm:py-1.5 text-stone-700 font-mono font-bold text-xs sm:text-sm outline-none cursor-pointer hover:bg-stone-200 focus:border-stone-400">
                  <option value="task">• Tarefa</option>
                  <option value="event">o Evento</option>
                  <option value="note">- Nota</option>
                </select>
              </div>

              <input 
                type="text" 
                [(ngModel)]="newItemContent" 
                name="content" 
                placeholder="Adicionar registro rápido..." 
                (keydown)="handleInputKeyDown($event)"
                class="flex-1 min-w-0 bg-transparent border-none outline-none text-stone-800 placeholder-stone-400 font-sans px-2 py-2 sm:py-1 text-sm sm:text-base"
                autocomplete="off"
              />
            </div>

            <button type="submit" [disabled]="!newItemContent.trim()" 
                    class="w-full sm:w-auto shrink-0 bg-stone-800 text-stone-100 px-3 py-2 sm:py-1.5 rounded font-mono text-xs sm:text-sm uppercase tracking-wider disabled:opacity-50 hover:bg-stone-900 transition-colors">
              <span class="hidden sm:inline">Adicionar</span>
              <span class="sm:hidden font-sans font-bold">Adicionar Registro +</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Lista de Itens do Dia -->
      <div class="flex flex-col gap-1 content-scroll">
        <ng-container *ngIf="todayItems.length > 0; else noItems">
          <app-bullet-item 
            *ngFor="let item of todayItems" 
            [id]="'item-' + item.id"
            [item]="item"
            [class.highlight-pulse]="highlightedId === item.id"
            (statusChange)="onStatusChange($event)"
            (delete)="onDelete($event)">
          </app-bullet-item>
        </ng-container>
        
        <ng-template #noItems>
          <div class="text-center py-12 text-stone-400 font-serif italic text-lg border-2 border-dashed border-stone-200 rounded">
            Nenhum registro para este dia.
          </div>
        </ng-template>
      </div>

      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class DailyLogComponent implements OnInit, OnDestroy {
  items: BujoItem[] = [];
  selectedDate: string = '';
  pageTurnClass: string = '';
  targetDateStr: string = '';
  
  private dataUpdateTimer: any;
  
  newItemContent: string = '';
  newItemType: 'task' | 'event' | 'note' = 'task';
  
  lastSavedContent: string = '';
  draftContent: string = '';
  showingHistory: boolean = false;
  highlightedId: string | null = null;
  
  private sub?: Subscription;
  private dateSub?: Subscription;
  private highlightSub?: Subscription;

  constructor(private bujoService: BujoService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.sub = this.bujoService.items$.subscribe(items => {
      this.items = items;
    });
    this.dateSub = this.bujoService.selectedDate$.subscribe(date => {
      this.selectedDate = date;
    });
    this.highlightSub = this.bujoService.highlightItemId$.subscribe(id => {
      if (id) {
        this.highlightedId = id;
        setTimeout(() => {
          const el = document.getElementById('item-' + id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
        // Clear highlight after 3 seconds
        setTimeout(() => {
          if (this.highlightedId === id) {
            this.highlightedId = null;
            this.bujoService.setHighlightItemId(null);
          }
        }, 3000);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.dateSub) this.dateSub.unsubscribe();
    if (this.highlightSub) this.highlightSub.unsubscribe();
  }

  get todayItems(): BujoItem[] {
    const dailyItems = this.items.filter(item => item.date === this.selectedDate);
    
    return dailyItems.sort((a, b) => {
      // Se os dois têm horário, ordena por horário
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      // Se só A tem horário, ele vem primeiro
      if (a.time && !b.time) {
        return -1;
      }
      // Se só B tem horário, ele vem primeiro
      if (!a.time && b.time) {
        return 1;
      }
      // Se nenhum tem horário, ordena por data de criação (cadastro)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
  }

  changeDay(delta: number) {
    const baseDateStr = this.targetDateStr || this.selectedDate;
    const d = new Date(baseDateStr + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    const newTarget = getLocalDateString(d);
    
    if (this.targetDateStr) {
      if (this.dataUpdateTimer) clearTimeout(this.dataUpdateTimer);
      this.bujoService.setSelectedDate(this.targetDateStr);
      this.cdr.detectChanges();
    }
    this.targetDateStr = newTarget;

    const isForward = delta > 0;
    if (isForward) {
      this.pageTurnClass = this.pageTurnClass === 'turn-page-forward' ? 'turn-page-forward-alt' : 'turn-page-forward';
    } else {
      this.pageTurnClass = this.pageTurnClass === 'turn-page-backward' ? 'turn-page-backward-alt' : 'turn-page-backward';
    }
    this.cdr.detectChanges(); // garante que a classeCSS alterne agora
    
    this.dataUpdateTimer = setTimeout(() => {
      this.bujoService.setSelectedDate(this.targetDateStr);
      this.targetDateStr = '';
      this.cdr.detectChanges(); // garante que o Angular aplique o novo HTML do novo dia
    }, 275);
  }

  goToToday() {
    const todayStr = getLocalDateString(new Date());
    const baseDateStr = this.targetDateStr || this.selectedDate;
    if (baseDateStr === todayStr) return;
    
    if (this.targetDateStr) {
      if (this.dataUpdateTimer) clearTimeout(this.dataUpdateTimer);
      this.bujoService.setSelectedDate(this.targetDateStr);
      this.cdr.detectChanges();
    }
    this.targetDateStr = todayStr;
    const isForward = todayStr > baseDateStr;
    
    if (isForward) {
      this.pageTurnClass = this.pageTurnClass === 'turn-page-forward' ? 'turn-page-forward-alt' : 'turn-page-forward';
    } else {
      this.pageTurnClass = this.pageTurnClass === 'turn-page-backward' ? 'turn-page-backward-alt' : 'turn-page-backward';
    }
    this.cdr.detectChanges();
    
    this.dataUpdateTimer = setTimeout(() => {
      this.bujoService.setSelectedDate(this.targetDateStr);
      this.targetDateStr = '';
      this.cdr.detectChanges();
    }, 275);
  }

  get formattedSelectedDate(): string {
    const parts = this.selectedDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return this.selectedDate;
  }

  get dayOfWeek(): string {
    if (!this.selectedDate) return '';
    const d = new Date(this.selectedDate + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long' });
  }

  handleAddItem(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    const input = this.newItemContent.trim();
    if (!input) return;

    const parsed = parseSmartTask(input, this.selectedDate);

    this.bujoService.addItem({
      content: parsed.cleanContent || input,
      type: this.newItemType,
      status: 'todo',
      date: parsed.date || this.selectedDate,
      time: parsed.time,
      endTime: parsed.endTime,
      priority: parsed.priority || false,
      energy: parsed.energy,
      complexity: parsed.complexity,
      reminderType: parsed.reminderType,
      constantReminder: parsed.constantReminder,
    });

    this.lastSavedContent = input;
    this.draftContent = '';
    this.showingHistory = false;
    this.newItemContent = '';
  }

  handleInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      if (!this.showingHistory && this.lastSavedContent) {
        this.draftContent = this.newItemContent;
        this.newItemContent = this.lastSavedContent;
        this.showingHistory = true;
        event.preventDefault();
      }
    } else if (event.key === 'ArrowDown') {
      if (this.showingHistory) {
        this.newItemContent = this.draftContent;
        this.showingHistory = false;
        event.preventDefault();
      }
    }
  }

  onStatusChange(updatedItem: BujoItem) {
    this.bujoService.updateItem(updatedItem.id, updatedItem);
  }

  onDelete(itemId: string) {
    this.bujoService.deleteItem(itemId);
  }
}
