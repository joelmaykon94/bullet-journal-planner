import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { SyncStatusService } from '../../../../services/sync-status.service';

export interface BigRock {
  id: number;
  text: string;
  completed: boolean;
}

@Component({
  selector: 'app-weekly-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" 
         class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
         (click)="closeOnBackdrop($event)">
      
      <div class="bg-[#fdfbf7] dark:bg-[#1c1917] border-2 border-[#4a3b32] dark:border-[#e3dac9]/30 rounded-2xl shadow-[8px_8px_0px_rgba(41,37,36,0.2)] dark:shadow-[8px_8px_0px_rgba(0,0,0,0.5)] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-5 py-4 border-b border-[#e2d5c3] dark:border-stone-800 flex items-center justify-between bg-[#f4ece1] dark:bg-[#262320]">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-[#4a3b32]/10 dark:bg-[#e3dac9]/10 text-[#4a3b32] dark:text-[#e3dac9]">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <div>
              <h3 class="font-serif text-lg font-bold text-[#4a3b32] dark:text-[#e3dac9] tracking-tight leading-snug">
                Assistente de Revisão Semanal GTD
              </h3>
              <p class="text-[11px] font-mono text-[#7a6656] dark:text-stone-400">
                O ritual definitivo para esvaziar a mente e manter o controle total.
              </p>
            </div>
          </div>
          
          <button (click)="close()" 
                  class="text-[#7a6656] dark:text-stone-400 hover:text-[#4a3b32] dark:hover:text-white p-1 rounded-lg hover:bg-[#e6dbcd] dark:hover:bg-stone-800 transition-colors text-xl font-bold leading-none">
            ×
          </button>
        </div>

        <!-- Wizard Stepper Indicator -->
        <div class="px-5 py-3 border-b border-[#e2d5c3] dark:border-stone-800 bg-white dark:bg-[#1c1917] flex items-center justify-between">
          <div *ngFor="let stepNum of [1, 2, 3, 4]" 
               class="flex items-center gap-2 cursor-pointer"
               (click)="currentStep = stepNum">
            <div [ngClass]="currentStep === stepNum 
                  ? 'bg-[#4a3b32] dark:bg-[#e3dac9] text-white dark:text-[#2a2724] font-bold scale-110' 
                  : (currentStep > stepNum ? 'bg-emerald-600 text-white font-bold' : 'bg-[#f2ebdf] dark:bg-stone-800 text-[#7a6656] dark:text-stone-400')"
                 class="w-7 h-7 rounded-full text-xs font-mono flex items-center justify-center transition-all border border-stone-300 dark:border-stone-700">
              <span *ngIf="currentStep > stepNum">✓</span>
              <span *ngIf="currentStep <= stepNum">{{ stepNum }}</span>
            </div>
            <span class="text-xs font-mono font-semibold hidden sm:inline text-[#4a3b32] dark:text-[#e3dac9]">
              {{ getStepName(stepNum) }}
            </span>
            <span *ngIf="stepNum < 4" class="text-stone-300 dark:text-stone-700 hidden sm:inline"><svg class="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
          </div>
        </div>

        <!-- Body Content per Step -->
        <div class="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          
          <!-- STEP 1: Get Clear (Inbox Zero) -->
          <div *ngIf="currentStep === 1" class="flex flex-col gap-4 animate-in fade-in duration-150">
            <div class="flex items-start gap-3 bg-[#f4ece1]/80 dark:bg-[#262320] p-4 rounded-xl border border-[#e2d5c3] dark:border-stone-800">
              <div class="p-2 rounded-xl bg-[#4a3b32]/10 dark:bg-[#e3dac9]/10 text-[#4a3b32] dark:text-[#e3dac9] shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
              </div>
              <div class="flex-1">
                <h4 class="font-serif font-bold text-base text-[#4a3b32] dark:text-[#e3dac9]">
                  Passo 1: Esvaziar a Caixa de Entrada (Inbox Zero)
                </h4>
                <p class="text-xs text-[#7a6656] dark:text-stone-400 mt-1 leading-relaxed">
                  Processe todos os pensamentos soltos gravados na sua Caixa de Entrada. Atribua contexto ou converta em tarefas acionáveis.
                </p>
              </div>
            </div>

            <!-- Inbox Status Card -->
            <div class="bg-white dark:bg-[#262320] border border-[#e2d5c3] dark:border-stone-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span class="text-xs font-mono text-stone-500 dark:text-stone-400">Itens na Caixa de Entrada:</span>
                <div class="text-2xl font-bold font-mono text-[#4a3b32] dark:text-[#e3dac9]">
                  {{ inboxItemsCount }} item(ns)
                </div>
              </div>
              <span [ngClass]="inboxItemsCount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                    class="px-3 py-1 rounded-full text-xs font-mono font-bold">
                {{ inboxItemsCount === 0 ? '✓ Inbox Zero Atingido' : 'Pendente de Processamento' }}
              </span>
            </div>

            <label class="flex items-center gap-3 p-3 bg-white dark:bg-[#262320] border border-[#e2d5c3] dark:border-stone-800 rounded-xl cursor-pointer hover:bg-[#f2ebdf]/50 transition-colors">
              <input type="checkbox" [(ngModel)]="step1Done" class="w-5 h-5 rounded accent-[#4a3b32] cursor-pointer" />
              <span class="text-sm font-semibold text-[#1c1917] dark:text-[#f5f5f4]">
                Confirmo que minha Caixa de Entrada foi revisada e processada.
              </span>
            </label>
          </div>

          <!-- STEP 2: Get Current (Central de Delegados) -->
          <div *ngIf="currentStep === 2" class="flex flex-col gap-4 animate-in fade-in duration-150">
            <div class="flex items-start gap-3 bg-[#f4ece1]/80 dark:bg-[#262320] p-4 rounded-xl border border-[#e2d5c3] dark:border-stone-800">
              <div class="p-2 rounded-xl bg-[#4a3b32]/10 dark:bg-[#e3dac9]/10 text-[#4a3b32] dark:text-[#e3dac9] shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="flex-1">
                <h4 class="font-serif font-bold text-base text-[#4a3b32] dark:text-[#e3dac9]">
                  Passo 2: Central de Delegados (@aguardando)
                </h4>
                <p class="text-xs text-[#7a6656] dark:text-stone-400 mt-1 leading-relaxed">
                  Verifique os compromissos cobrados de terceiros ou aguardando resposta. Faça follow-ups se necessário.
                </p>
              </div>
            </div>

            <!-- Delegated Status Card -->
            <div class="bg-white dark:bg-[#262320] border border-[#e2d5c3] dark:border-stone-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span class="text-xs font-mono text-stone-500 dark:text-stone-400">Cobranças Ativas (@aguardando):</span>
                <div class="text-2xl font-bold font-mono text-[#4a3b32] dark:text-[#e3dac9]">
                  {{ waitingItemsCount }} pendência(s)
                </div>
              </div>
              <span class="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-[#4a3b32] dark:text-[#e3dac9] rounded-full text-xs font-mono font-bold">
                Status Revisado
              </span>
            </div>

            <label class="flex items-center gap-3 p-3 bg-white dark:bg-[#262320] border border-[#e2d5c3] dark:border-stone-800 rounded-xl cursor-pointer hover:bg-[#f2ebdf]/50 transition-colors">
              <input type="checkbox" [(ngModel)]="step2Done" class="w-5 h-5 rounded accent-[#4a3b32] cursor-pointer" />
              <span class="text-sm font-semibold text-[#1c1917] dark:text-[#f5f5f4]">
                Confirmo que verifiquei todas as cobranças da Central de Delegados.
              </span>
            </label>
          </div>

          <!-- STEP 3: Get Strategic (Log Diário & Coleções) -->
          <div *ngIf="currentStep === 3" class="flex flex-col gap-4 animate-in fade-in duration-150">
            <div class="flex items-start gap-3 bg-[#f4ece1]/80 dark:bg-[#262320] p-4 rounded-xl border border-[#e2d5c3] dark:border-stone-800">
              <div class="p-2 rounded-xl bg-[#4a3b32]/10 dark:bg-[#e3dac9]/10 text-[#4a3b32] dark:text-[#e3dac9] shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <div class="flex-1">
                <h4 class="font-serif font-bold text-base text-[#4a3b32] dark:text-[#e3dac9]">
                  Passo 3: Revisão do Log Diário & Coleções
                </h4>
                <p class="text-xs text-[#7a6656] dark:text-stone-400 mt-1 leading-relaxed">
                  Passe o olho pelos registros dos últimos 7 dias. Migre tarefas pendentes e cheque suas coleções de projetos ativos.
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="flex items-center gap-3 p-3 bg-white dark:bg-[#262320] border border-[#e2d5c3] dark:border-stone-800 rounded-xl cursor-pointer hover:bg-[#f2ebdf]/50 transition-colors">
                <input type="checkbox" [(ngModel)]="step3Sub1Done" class="w-5 h-5 rounded accent-[#4a3b32] cursor-pointer" />
                <span class="text-sm font-semibold text-[#1c1917] dark:text-[#f5f5f4]">
                  Revisei os diários da semana e migrei as pendências.
                </span>
              </label>

              <label class="flex items-center gap-3 p-3 bg-white dark:bg-[#262320] border border-[#e2d5c3] dark:border-stone-800 rounded-xl cursor-pointer hover:bg-[#f2ebdf]/50 transition-colors">
                <input type="checkbox" [(ngModel)]="step3Sub2Done" class="w-5 h-5 rounded accent-[#4a3b32] cursor-pointer" />
                <span class="text-sm font-semibold text-[#1c1917] dark:text-[#f5f5f4]">
                  Verifiquei as coleções de projetos ativos.
                </span>
              </label>
            </div>
          </div>

          <!-- STEP 4: Big Rocks (As 3 Metas da Próxima Semana) -->
          <div *ngIf="currentStep === 4" class="flex flex-col gap-4 animate-in fade-in duration-150">
            <div class="flex items-start gap-3 bg-[#f4ece1]/80 dark:bg-[#262320] p-4 rounded-xl border border-[#e2d5c3] dark:border-stone-800">
              <div class="p-2 rounded-xl bg-[#4a3b32]/10 dark:bg-[#e3dac9]/10 text-[#4a3b32] dark:text-[#e3dac9] shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              </div>
              <div class="flex-1">
                <h4 class="font-serif font-bold text-base text-[#4a3b32] dark:text-[#e3dac9]">
                  Passo 4: As 3 Grandes Metas da Próxima Semana (Big Rocks)
                </h4>
                <p class="text-xs text-[#7a6656] dark:text-stone-400 mt-1 leading-relaxed">
                  Defina os 3 objetivos prioritários que tornarão a próxima semana um sucesso absoluto.
                </p>
              </div>
            </div>

            <!-- 3 Inputs for Big Rocks -->
            <div class="flex flex-col gap-3">
              <div *ngFor="let rock of bigRocks; let i = index" class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-full bg-[#4a3b32] dark:bg-[#e3dac9] text-white dark:text-[#2a2724] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {{ i + 1 }}
                </span>
                <input type="text" 
                       [(ngModel)]="rock.text" 
                       placeholder="Ex.: Entregar rascunho do artigo do mestrado..." 
                       class="flex-1 bg-white dark:bg-[#262320] border border-[#e2d5c3] dark:border-stone-700 rounded-xl px-3.5 py-2 text-sm font-semibold text-[#1c1917] dark:text-[#f5f5f4] outline-none focus:border-[#4a3b32] dark:focus:border-[#e3dac9] transition-colors" />
              </div>
            </div>
          </div>

        </div>

        <!-- Footer Navigation -->
        <div class="px-5 py-4 border-t border-[#e2d5c3] dark:border-stone-800 bg-[#f4ece1] dark:bg-[#262320] flex items-center justify-between">
          <button *ngIf="currentStep > 1" 
                  (click)="prevStep()" 
                  class="px-4 py-2 bg-[#f2ebdf] hover:bg-[#e6dbcd] dark:bg-stone-800 dark:hover:bg-stone-700 text-[#4a3b32] dark:text-[#e3dac9] font-mono text-xs font-bold rounded-xl transition-all border border-[#d7c8b4] dark:border-stone-700 cursor-pointer">
            ◄ Anterior
          </button>
          
          <div class="flex-1"></div>

          <button *ngIf="currentStep < 4" 
                  (click)="nextStep()" 
                  class="px-5 py-2 bg-[#4a3b32] hover:bg-[#382c25] text-white font-mono text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer">
            Próximo Passo ►
          </button>

          <button *ngIf="currentStep === 4" 
                  (click)="finishWeeklyReview()" 
                  class="px-6 py-2.5 bg-[#4a3b32] hover:bg-[#382c25] text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>Concluir Revisão Semanal GTD</span>
          </button>
        </div>

      </div>
    </div>
  `
})
export class WeeklyReviewModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  currentStep = 1;

  step1Done = false;
  step2Done = false;
  step3Sub1Done = false;
  step3Sub2Done = false;

  inboxItemsCount = 0;
  waitingItemsCount = 0;

  bigRocks: BigRock[] = [
    { id: 1, text: '', completed: false },
    { id: 2, text: '', completed: false },
    { id: 3, text: '', completed: false }
  ];

  constructor(
    private bujoService: BujoService,
    private syncStatusService: SyncStatusService
  ) {}

  ngOnInit() {
    this.refreshCounts();
    this.loadSavedBigRocks();
  }

  refreshCounts() {
    // Count Inbox items from localStorage
    const savedInbox = typeof localStorage !== 'undefined' ? localStorage.getItem('bujo_inbox') : null;
    let parsedInbox: any[] = [];
    if (savedInbox) {
      try { parsedInbox = JSON.parse(savedInbox); } catch (e) {}
    }
    this.inboxItemsCount = Array.isArray(parsedInbox) ? parsedInbox.length : 0;

    // Count Waiting items
    const allItems = this.bujoService.getItems();
    this.waitingItemsCount = allItems.filter(item => {
      const isWaitingTag = item.content && item.content.toLowerCase().includes('@aguardando');
      const isNotDeleted = !item.deletedAt;
      const isNotDone = item.status !== 'completed' && item.status !== 'cancelled';
      return (isWaitingTag || item.delegatedTo) && isNotDeleted && isNotDone;
    }).length;
  }

  getStepName(step: number): string {
    switch (step) {
      case 1: return 'Inbox Zero';
      case 2: return 'Delegados';
      case 3: return 'Diário & Projetos';
      case 4: return 'Big Rocks';
      default: return '';
    }
  }

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  loadSavedBigRocks() {
    const saved = localStorage.getItem('bujo_weekly_big_rocks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          this.bigRocks = parsed;
        }
      } catch (e) {}
    }
  }

  finishWeeklyReview() {
    // Save Big Rocks
    localStorage.setItem('bujo_weekly_big_rocks', JSON.stringify(this.bigRocks));
    localStorage.setItem('bujo_last_weekly_review_date', new Date().toISOString());

    this.syncStatusService.showToast({
      type: 'success',
      message: '🎉 Ritual de Revisão Semanal GTD Concluído com Sucesso! Mente limpa e focada.'
    });

    this.close();
  }

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  closeOnBackdrop(event: MouseEvent) {
    this.close();
  }
}
