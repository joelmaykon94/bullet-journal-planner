import { Component, OnInit, OnDestroy, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { getLocalDateString } from '../../../../utils/smartParser';

@Component({
  selector: 'app-monthly-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col max-w-6xl mx-auto w-full pb-20 animate-fade-in">
      
      <!-- Cabeçalho & Navegação do Mês -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-stone-800 pb-4 mb-6 gap-4">
        <div>
          <h1 class="text-3xl sm:text-4xl font-serif text-stone-900 font-bold italic tracking-tight">Log Mensal</h1>
          <p class="text-sm text-stone-500 font-mono mt-1 uppercase tracking-widest">Visão Macro & Análise</p>
        </div>
        
        <div class="flex items-center gap-2 bg-stone-100 p-1 rounded border border-stone-200 shadow-sm self-start sm:self-auto">
          <button (click)="navigateMonth(-1)" class="p-1.5 rounded hover:bg-stone-200 transition-colors text-stone-600" title="Mês Anterior">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span class="text-xs font-mono font-bold px-3 text-stone-800 whitespace-nowrap min-w-[120px] text-center">
            {{ getMonthName() }} {{ currentYearMonth.year }}
          </span>
          <button (click)="navigateMonth(1)" class="p-1.5 rounded hover:bg-stone-200 transition-colors text-stone-600" title="Próximo Mês">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          
          <button *ngIf="!isCurrentMonth()" (click)="goToCurrentMonth()" class="ml-2 p-1 px-2.5 rounded bg-stone-800 text-stone-100 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-stone-700">
            Mês Atual
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        <!-- Esquerda: Calendário Grid -->
        <div class="lg:col-span-7 flex flex-col space-y-4">
          <div class="grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-bold text-stone-500 uppercase tracking-widest py-2 border-b border-stone-200">
            <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
          </div>

          <div class="grid grid-cols-7 gap-2">
            <ng-container *ngFor="let day of calendarDays">
              <!-- Célula Vazia (dias de outros meses) -->
              <div *ngIf="day === null" class="aspect-square rounded-xl bg-transparent"></div>
              
              <!-- Célula do Dia -->
              <div *ngIf="day !== null"
                   (click)="selectDate(day)"
                   class="aspect-square p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:border-stone-400 group relative"
                   [class.bg-white]="day !== selectedDate"
                   [class.border-stone-200]="day !== selectedDate"
                   [class.bg-stone-800]="day === selectedDate"
                   [class.text-stone-100]="day === selectedDate"
                   [class.shadow-md]="day === selectedDate"
                   [class.ring-2]="isToday(day)" [class.ring-amber-400]="isToday(day)">
                
                <span class="text-xs font-mono font-bold self-start" [class.text-amber-600]="isToday(day) && day !== selectedDate" [class.text-stone-400]="day !== selectedDate && !isToday(day)">
                  {{ getDayNumber(day) }}
                </span>

                <div class="flex gap-1 mt-auto flex-wrap">
                  <!-- Indicators -->
                  <span *ngIf="hasEvents(day)" class="w-1.5 h-1.5 rounded-full bg-stone-400" [class.bg-stone-300]="day === selectedDate"></span>
                  <span *ngIf="hasTasks(day)" class="w-1.5 h-1.5 rounded-full" [ngClass]="hasUncompleted(day) ? 'bg-amber-500' : 'bg-emerald-500'"></span>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Direita: Detalhes do Dia & Retrospectiva -->
        <div class="lg:col-span-5 flex flex-col gap-6">
          
          <!-- Detalhes do Dia Selecionado -->
          <div class="p-6 rounded-xl bg-white border border-stone-200 shadow-sm flex flex-col min-h-[300px]">
            <div class="flex justify-between items-baseline border-b border-stone-100 pb-3 mb-4">
              <span class="text-[10px] text-stone-400 font-mono uppercase tracking-widest">Registros do Dia</span>
              <span class="text-sm font-bold font-serif text-stone-800">
                {{ formatSelectedDate() }}
              </span>
            </div>

            <div class="flex-1 overflow-y-auto space-y-3">
              <div *ngIf="getSelectedDayItems().length === 0" class="text-sm text-stone-400 italic py-4 text-center">
                Sem registros neste dia.
              </div>

              <div *ngFor="let item of getSelectedDayItems()" class="flex items-start gap-2 text-sm text-stone-700">
                <span class="font-mono mt-0.5 shrink-0 cursor-default bujo-tooltip" [attr.data-tooltip]="getStatusTooltip(item)" [class.text-stone-300]="item.status === 'completed'" [class.text-stone-500]="item.status !== 'completed'">
                  {{ getSymbol(item) }}
                </span>
                <span class="leading-relaxed" [class.line-through]="item.status === 'completed'" [class.text-stone-400]="item.status === 'completed'">
                  {{ item.content }}
                </span>
              </div>
            </div>

            <button (click)="openDailyLog()" class="mt-4 w-full py-2 rounded bg-stone-800 text-stone-100 text-xs font-bold uppercase tracking-widest hover:bg-stone-700 transition-colors">
              Abrir Agenda do Dia
            </button>
          </div>

          <!-- Retrospectiva Mensal -->
          <div class="p-6 rounded-xl bg-stone-100 border border-stone-200 shadow-sm flex flex-col">
            <div class="text-sm font-bold text-stone-800 font-serif italic border-b border-stone-200 pb-2 mb-4">
              Reflexão Mensal
            </div>
            
            <textarea
              [(ngModel)]="monthlyReview"
              (ngModelChange)="saveReview($event)"
              placeholder="Quais foram as grandes conquistas deste mês? O que precisa ser ajustado para o próximo? (Salvo automaticamente)"
              class="w-full flex-1 min-h-[150px] bg-white border border-stone-200 rounded p-4 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 resize-none transition-all content-scroll"
            ></textarea>
          </div>

        </div>

      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class MonthlyLogComponent implements OnInit, OnDestroy {
  @Output() tabChange = new EventEmitter<string>();
  
  items: BujoItem[] = [];
  selectedDate: string = '';
  
  currentYearMonth = { year: new Date().getFullYear(), month: new Date().getMonth() };
  calendarDays: (string | null)[] = [];
  
  monthlyReview = '';
  
  private sub?: Subscription;
  private dateSub?: Subscription;

  constructor(private bujoService: BujoService) {}

  ngOnInit() {
    this.sub = this.bujoService.items$.subscribe(items => {
      this.items = items;
    });
    this.dateSub = this.bujoService.selectedDate$.subscribe(date => {
      if (date) {
        this.selectedDate = date;
        const [y, m] = date.split('-');
        // Only update calendar if we change month
        if (this.currentYearMonth.year !== parseInt(y) || this.currentYearMonth.month !== parseInt(m) - 1) {
            this.currentYearMonth = { year: parseInt(y), month: parseInt(m) - 1 };
        }
        this.updateCalendarDays();
        this.loadReview();
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.dateSub) this.dateSub.unsubscribe();
  }

  updateCalendarDays() {
    const year = this.currentYearMonth.year;
    const month = this.currentYearMonth.month;
    const date = new Date(year, month, 1);
    const days: (string | null)[] = [];
    
    // Fill empty slots for days of previous month (Monday start)
    let firstDayIndex = date.getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      // Create local string by formatting locally to avoid timezone drift
      const d = new Date(date);
      const dayStr = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      days.push(dayStr);
      date.setDate(date.getDate() + 1);
    }

    this.calendarDays = days;
  }

  getMonthName(): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[this.currentYearMonth.month];
  }

  getDayNumber(dateStr: string): string {
    const [, , d] = dateStr.split('-');
    return d;
  }

  formatSelectedDate(): string {
    if (!this.selectedDate) return '';
    const [y, m, d] = this.selectedDate.split('-');
    return `${d}/${m}/${y}`;
  }

  isToday(dateStr: string): boolean {
    return dateStr === getLocalDateString();
  }

  isCurrentMonth(): boolean {
    const today = new Date();
    return this.currentYearMonth.year === today.getFullYear() && this.currentYearMonth.month === today.getMonth();
  }

  navigateMonth(delta: number) {
    let newMonth = this.currentYearMonth.month + delta;
    let newYear = this.currentYearMonth.year;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    
    // Set to 1st of new month
    const newDateStr = `${newYear}-${(newMonth+1).toString().padStart(2, '0')}-01`;
    this.bujoService.setSelectedDate(newDateStr);
  }

  goToCurrentMonth() {
    this.bujoService.setSelectedDate(getLocalDateString());
  }
  
  selectDate(dayStr: string) {
    this.bujoService.setSelectedDate(dayStr);
  }

  // Helpers for indicators
  hasEvents(dayStr: string): boolean {
    return this.items.some(i => i.date === dayStr && i.type === 'event' && i.status !== 'cancelled');
  }
  hasTasks(dayStr: string): boolean {
    return this.items.some(i => i.date === dayStr && i.type === 'task' && i.status !== 'cancelled');
  }
  hasUncompleted(dayStr: string): boolean {
    return this.items.some(i => i.date === dayStr && i.type === 'task' && i.status !== 'completed' && i.status !== 'cancelled');
  }

  getSelectedDayItems(): BujoItem[] {
    return this.items.filter(item => item.date === this.selectedDate && item.status !== 'cancelled');
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

  loadReview() {
    const key = `bujo_monthly_review_${this.currentYearMonth.year}_${this.currentYearMonth.month}`;
    this.monthlyReview = localStorage.getItem(key) || '';
  }

  saveReview(val: string) {
    const key = `bujo_monthly_review_${this.currentYearMonth.year}_${this.currentYearMonth.month}`;
    localStorage.setItem(key, val);
  }

  openDailyLog() {
    this.tabChange.emit('daily');
  }
}
