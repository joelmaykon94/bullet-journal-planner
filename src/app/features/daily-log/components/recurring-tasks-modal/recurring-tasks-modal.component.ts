import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { SyncStatusService } from '../../../../services/sync-status.service';
import { getLocalDateString } from '../../../../utils/smartParser';

@Component({
  selector: 'app-recurring-tasks-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" 
         class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
         (click)="closeOnBackdrop($event)">
      
      <div class="bg-[#fdfbf7] dark:bg-[#1c1917] border-2 border-[#4a3b32] dark:border-[#e3dac9]/30 rounded-2xl shadow-[8px_8px_0px_rgba(41,37,36,0.2)] dark:shadow-[8px_8px_0px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-5 py-4 border-b border-[#e2d5c3] dark:border-stone-800 flex items-center justify-between bg-[#f4ece1] dark:bg-[#262320]">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-[#4a3b32]/10 dark:bg-[#e3dac9]/10 text-[#4a3b32] dark:text-[#e3dac9]">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>
              </svg>
            </div>
            <div>
              <h3 class="font-serif text-lg font-bold text-[#4a3b32] dark:text-[#e3dac9] tracking-tight leading-snug">
                Tarefas Recorrentes Automáticas
              </h3>
              <p class="text-[11px] font-mono text-[#7a6656] dark:text-stone-400">
                Agendamento automático para compromissos fixos e hábitos de rotina.
              </p>
            </div>
          </div>
          
          <button (click)="close()" 
                  class="text-[#7a6656] dark:text-stone-400 hover:text-[#4a3b32] dark:hover:text-white p-1 rounded-lg hover:bg-[#e6dbcd] dark:hover:bg-stone-800 transition-colors text-xl font-bold leading-none">
            ×
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          
          <!-- New Recurring Task Form -->
          <div class="bg-white dark:bg-[#262320] border-2 border-[#e2d5c3] dark:border-stone-700 rounded-xl p-4 flex flex-col gap-3 shadow-xs">
            <h4 class="font-serif font-bold text-sm text-[#4a3b32] dark:text-[#e3dac9] flex items-center gap-2">
              <svg class="w-4 h-4 text-[#4a3b32] dark:text-[#e3dac9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span>Cadastrar Nova Tarefa Recorrente</span>
            </h4>

            <div class="flex flex-col gap-2.5">
              <input type="text" 
                     [(ngModel)]="newContent" 
                     placeholder="Ex.: Pagar fatura do cartão, Relatório semanal..." 
                     class="w-full bg-[#f4ece1] dark:bg-stone-900 border border-[#e2d5c3] dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-[#1c1917] dark:text-[#f5f5f4] outline-none" />

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-mono text-stone-500 dark:text-stone-400 mb-1">Padrão de Repetição:</label>
                  <select [(ngModel)]="newRecurrence" 
                          class="w-full bg-[#f4ece1] dark:bg-stone-900 border border-[#e2d5c3] dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-semibold text-[#4a3b32] dark:text-[#e3dac9] outline-none">
                    <option value="daily">Diária</option>
                    <option value="weekdays">Dias Úteis (Seg-Sex)</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>

                <div>
                  <label class="block text-[10px] font-mono text-stone-500 dark:text-stone-400 mb-1">Data Inicial:</label>
                  <input type="date" 
                         [(ngModel)]="startDate" 
                         class="w-full bg-[#f4ece1] dark:bg-stone-900 border border-[#e2d5c3] dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#4a3b32] dark:text-[#e3dac9] outline-none" />
                </div>
              </div>

              <button (click)="createRecurringTask()" 
                      class="mt-1 w-full py-2 bg-[#4a3b32] hover:bg-[#382c25] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Salvar Regra Recorrente</span>
              </button>
            </div>
          </div>

          <!-- Active Recurring Tasks List -->
          <div class="flex flex-col gap-2">
            <h4 class="font-serif font-bold text-sm text-[#4a3b32] dark:text-[#e3dac9]">
              Regras Ativas ({{ recurringItems.length }})
            </h4>

            <div *ngIf="recurringItems.length === 0" class="text-center py-6 text-stone-400 font-mono text-xs italic border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
              Nenhuma tarefa recorrente cadastrada.
            </div>

            <div *ngFor="let item of recurringItems" 
                 class="bg-white dark:bg-[#262320] border border-[#e2d5c3] dark:border-stone-800 rounded-xl p-3 flex items-center justify-between gap-2 shadow-xs">
              
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#f2ebdf] dark:bg-stone-800 text-[#4a3b32] dark:text-[#e3dac9] flex items-center gap-1">
                    <svg class="w-3 h-3 text-[#4a3b32] dark:text-[#e3dac9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>
                    </svg>
                    <span>{{ getRecurrenceLabel(item.recurrence) }}</span>
                  </span>
                  <span class="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                    Próxima: {{ item.date }}
                  </span>
                </div>
                <p class="font-sans text-xs font-bold text-[#1c1917] dark:text-[#f5f5f4] truncate">
                  {{ item.content }}
                </p>
              </div>

              <button (click)="removeRecurringTask(item)" 
                      class="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                      title="Excluir regra recorrente">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>

            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-[#e2d5c3] dark:border-stone-800 bg-[#f4ece1] dark:bg-[#262320] flex items-center justify-between">
          <span class="text-[11px] font-mono text-[#7a6656] dark:text-stone-400">
            Ao concluir uma tarefa recorrente, a próxima data é gerada automaticamente.
          </span>
          <button (click)="close()" 
                  class="px-4 py-1.5 bg-[#4a3b32] hover:bg-[#382c25] text-white font-mono text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer">
            Fechar
          </button>
        </div>

      </div>
    </div>
  `
})
export class RecurringTasksModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  newContent = '';
  newRecurrence: 'daily' | 'weekly' | 'monthly' | 'weekdays' = 'weekly';
  startDate = getLocalDateString();

  recurringItems: BujoItem[] = [];

  constructor(
    private bujoService: BujoService,
    private syncStatusService: SyncStatusService
  ) {}

  ngOnInit() {
    this.refreshRecurringItems();
    this.bujoService.items$.subscribe(() => {
      this.refreshRecurringItems();
    });
  }

  refreshRecurringItems() {
    const allItems = this.bujoService.getItems();
    const seen = new Set<string>();
    this.recurringItems = allItems.filter(item => {
      const isRecurring = item.recurrence && item.recurrence !== 'none';
      const isNotDeleted = !item.deletedAt;
      if (isRecurring && isNotDeleted && !seen.has(item.content)) {
        seen.add(item.content);
        return true;
      }
      return false;
    });
  }

  getRecurrenceLabel(recurrence?: string): string {
    switch (recurrence) {
      case 'daily': return 'Diária';
      case 'weekdays': return 'Dias Úteis';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      default: return 'Recorrente';
    }
  }

  createRecurringTask() {
    const text = this.newContent.trim();
    if (!text) {
      this.syncStatusService.showToast({
        type: 'offline',
        message: 'Por favor, digite o nome da tarefa recorrente.'
      });
      return;
    }

    this.bujoService.addItem({
      content: text,
      type: 'task',
      status: 'todo',
      date: this.startDate || getLocalDateString(),
      recurrence: this.newRecurrence
    });

    this.syncStatusService.showToast({
      type: 'success',
      message: `Tarefas recorrentes: "${text}" cadastrada!`
    });

    this.newContent = '';
    this.refreshRecurringItems();
  }

  removeRecurringTask(item: BujoItem) {
    this.bujoService.deleteItem(item.id);
    this.syncStatusService.showToast({
      type: 'offline',
      message: `Regra recorrente "${item.content}" removida.`
    });
    this.refreshRecurringItems();
  }

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  closeOnBackdrop(event: MouseEvent) {
    this.close();
  }
}
