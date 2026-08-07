import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { SyncStatusService } from '../../../../services/sync-status.service';
import { getLocalDateString } from '../../../../utils/smartParser';

@Component({
  selector: 'app-daily-migration-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" 
         class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
         (click)="closeOnBackdrop($event)">
      
      <div class="bg-[#fdfbf7] dark:bg-[#1c1917] border-2 border-[#4a3b32] dark:border-[#e3dac9]/30 rounded-2xl shadow-[8px_8px_0px_rgba(41,37,36,0.2)] dark:shadow-[8px_8px_0px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
           (click)="$event.stopPropagation()">
        
        <!-- Modal Header -->
        <div class="px-5 py-4 border-b border-[#e2d5c3] dark:border-stone-800 flex items-center justify-between bg-[#f4ece1] dark:bg-[#262320]">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-[#4a3b32]/10 dark:bg-[#e3dac9]/10 text-[#4a3b32] dark:text-[#e3dac9]">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            </div>
            <div>
              <h3 class="font-serif text-lg font-bold text-[#4a3b32] dark:text-[#e3dac9] tracking-tight leading-snug">
                Assistente de Migração Diária
              </h3>
              <p class="text-[11px] font-mono text-[#7a6656] dark:text-stone-400">
                Organize as pendências de dias anteriores para manter o foco no hoje.
              </p>
            </div>
          </div>
          
          <button (click)="close()" 
                  class="text-[#7a6656] dark:text-stone-400 hover:text-[#4a3b32] dark:hover:text-white p-1 rounded-lg hover:bg-[#e6dbcd] dark:hover:bg-stone-800 transition-colors text-xl font-bold leading-none">
            ×
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          
          <!-- State: No Pending Past Items -->
          <div *ngIf="pendingItems.length === 0" class="py-8 flex flex-col items-center justify-center text-center gap-3">
            <div class="w-14 h-14 rounded-full bg-[#f2ebdf] dark:bg-[#262320] text-[#4a3b32] dark:text-[#e3dac9] flex items-center justify-center shadow-inner border border-[#e2d5c3] dark:border-stone-800">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <h4 class="font-serif font-bold text-base text-[#4a3b32] dark:text-[#e3dac9]">
                Tudo limpo! Nenhuma pendência antiga.
              </h4>
              <p class="text-xs text-[#7a6656] dark:text-stone-400 mt-1 max-w-xs">
                Você não possui tarefas pendentes de dias passados. Seu diário está 100% em dia!
              </p>
            </div>
            <button (click)="close()" 
                    class="mt-2 px-5 py-2 bg-[#4a3b32] hover:bg-[#382c25] text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl transition-all shadow-xs cursor-pointer">
              Fechar Assistente
            </button>
          </div>

          <!-- State: Pending Items Available -->
          <ng-container *ngIf="pendingItems.length > 0">
            
            <!-- Global Migration Progress Banner -->
            <div class="flex items-center justify-between text-xs font-mono text-[#7a6656] dark:text-stone-400 bg-[#f4ece1]/60 dark:bg-[#262320]/60 p-2.5 rounded-xl border border-[#e2d5c3] dark:border-stone-800">
              <span class="font-bold text-[#4a3b32] dark:text-[#e3dac9]">
                Item {{ currentIndex + 1 }} de {{ pendingItems.length }}
              </span>
              <div class="flex items-center gap-2">
                <button (click)="bulkMoveAllToToday()" 
                        class="text-[10px] text-[#4a3b32] dark:text-[#e3dac9] underline hover:font-bold font-semibold transition-all flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Mover Todas para Hoje
                </button>
              </div>
            </div>

            <!-- Current Active Item Card -->
            <div *ngIf="currentItem" class="bg-white dark:bg-[#262320] border-2 border-[#e2d5c3] dark:border-stone-700 rounded-xl p-4 flex flex-col gap-3 shadow-xs relative">
              
              <!-- Item Header Tag & Date -->
              <div class="flex items-center justify-between gap-2 border-b border-[#f2ebdf] dark:border-stone-800 pb-2">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#f2ebdf] dark:bg-stone-800 text-[#4a3b32] dark:text-[#e3dac9]">
                  {{ getItemTypeLabel(currentItem.type) }}
                </span>
                <span class="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                  Data original: <strong class="text-[#4a3b32] dark:text-[#e3dac9]">{{ currentItem.date }}</strong>
                </span>
              </div>

              <!-- Item Content -->
              <p class="font-sans text-base font-semibold text-[#1c1917] dark:text-[#f5f5f4] leading-snug">
                {{ currentItem.content }}
              </p>

              <!-- Optional Custom Date Input (if user wants to reschedule to specific date) -->
              <div *ngIf="showCustomDatePicker" class="flex items-center gap-2 mt-1 animate-in fade-in duration-150">
                <input type="date" 
                       [(ngModel)]="customTargetDate" 
                       class="flex-1 bg-[#f4ece1] dark:bg-stone-900 border border-[#e2d5c3] dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#4a3b32] dark:text-[#e3dac9] outline-none" />
                <button (click)="confirmCustomDateSchedule()" 
                        class="px-3 py-1.5 bg-[#4a3b32] hover:bg-[#382c25] text-white font-mono text-xs rounded-lg font-semibold transition-all">
                  Confirmar
                </button>
              </div>

              <!-- Action Buttons for Current Item -->
              <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#f2ebdf] dark:border-stone-800">
                
                <!-- Action 1: Move to Today -->
                <button (click)="moveToToday(currentItem)" 
                        class="px-3 py-2 bg-[#4a3b32] hover:bg-[#382c25] text-white font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Mover p/ Hoje</span>
                </button>

                <!-- Action 2: Schedule Future Date -->
                <button (click)="toggleCustomDatePicker()" 
                        class="px-3 py-2 bg-[#f2ebdf] hover:bg-[#e6dbcd] dark:bg-stone-800 dark:hover:bg-stone-700 text-[#4a3b32] dark:text-[#e3dac9] font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-[#d7c8b4] dark:border-stone-700 transition-all active:scale-95 cursor-pointer">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>Agendar Data</span>
                </button>

                <!-- Action 3: Cancel / Trash -->
                <button (click)="cancelTask(currentItem)" 
                        class="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-mono text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-900/50 transition-all active:scale-95 cursor-pointer">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  <span>Cancelar</span>
                </button>

                <!-- Action 4: Skip -->
                <button (click)="skipCurrentItem()" 
                        class="px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-mono text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-stone-300 dark:border-stone-700 transition-all active:scale-95 cursor-pointer">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
                  <span>Manter Assim</span>
                </button>

              </div>

            </div>

          </ng-container>

        </div>

        <!-- Modal Footer -->
        <div class="px-5 py-3 border-t border-[#e2d5c3] dark:border-stone-800 bg-[#f4ece1] dark:bg-[#262320] flex items-center justify-between">
          <span class="text-[11px] font-mono text-[#7a6656] dark:text-stone-400">
            {{ pendingItems.length }} pendências encontradas
          </span>
          <button (click)="close()" 
                  class="px-4 py-1.5 bg-[#4a3b32] hover:bg-[#382c25] text-white font-mono text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer">
            Concluir
          </button>
        </div>

      </div>
    </div>
  `
})
export class DailyMigrationModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  pendingItems: BujoItem[] = [];
  currentIndex = 0;
  showCustomDatePicker = false;
  customTargetDate = getLocalDateString();

  constructor(
    private bujoService: BujoService,
    private syncStatusService: SyncStatusService
  ) {}

  ngOnInit() {
    this.refreshPendingItems();
  }

  refreshPendingItems() {
    const today = getLocalDateString();
    const allItems = this.bujoService.getItems();
    
    // Filter items with past dates that are still pending (todo or in_progress)
    this.pendingItems = allItems.filter(item => {
      const isPastDate = item.date && item.date < today;
      const isPending = item.status === 'todo' || item.status === 'in_progress';
      const isNotDeleted = !item.deletedAt;
      return isPastDate && isPending && isNotDeleted;
    });

    if (this.currentIndex >= this.pendingItems.length) {
      this.currentIndex = Math.max(0, this.pendingItems.length - 1);
    }
  }

  get currentItem(): BujoItem | null {
    if (this.pendingItems.length === 0 || this.currentIndex >= this.pendingItems.length) {
      return null;
    }
    return this.pendingItems[this.currentIndex];
  }

  getItemTypeLabel(type: string): string {
    switch (type) {
      case 'task': return '• Tarefa';
      case 'event': return 'o Evento';
      case 'note': return '- Nota';
      default: return '• Tarefa';
    }
  }

  moveToToday(item: BujoItem) {
    const today = getLocalDateString();
    this.bujoService.updateItem(item.id, {
      date: today,
      status: 'todo',
      updatedAt: new Date().toISOString()
    });

    this.syncStatusService.showToast({
      type: 'success',
      message: `📌 Tarefa "${item.content}" movida para Hoje!`
    });

    this.refreshPendingItems();
  }

  toggleCustomDatePicker() {
    this.showCustomDatePicker = !this.showCustomDatePicker;
    this.customTargetDate = getLocalDateString();
  }

  confirmCustomDateSchedule() {
    if (!this.currentItem || !this.customTargetDate) return;
    
    const targetItem = this.currentItem;
    this.bujoService.updateItem(targetItem.id, {
      date: this.customTargetDate,
      status: 'scheduled',
      updatedAt: new Date().toISOString()
    });

    this.syncStatusService.showToast({
      type: 'success',
      message: `📅 Tarefa agendada para ${this.customTargetDate}!`
    });

    this.showCustomDatePicker = false;
    this.refreshPendingItems();
  }

  cancelTask(item: BujoItem) {
    this.bujoService.updateItem(item.id, {
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    });

    this.syncStatusService.showToast({
      type: 'offline',
      message: `❌ Tarefa "${item.content}" cancelada.`
    });

    this.refreshPendingItems();
  }

  skipCurrentItem() {
    if (this.currentIndex < this.pendingItems.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  bulkMoveAllToToday() {
    const today = getLocalDateString();
    const count = this.pendingItems.length;

    this.pendingItems.forEach(item => {
      this.bujoService.updateItem(item.id, {
        date: today,
        status: 'todo',
        updatedAt: new Date().toISOString()
      });
    });

    this.syncStatusService.showToast({
      type: 'success',
      message: `🎉 ${count} pendências movidas para Hoje com sucesso!`
    });

    this.refreshPendingItems();
  }

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  closeOnBackdrop(event: MouseEvent) {
    this.close();
  }
}
