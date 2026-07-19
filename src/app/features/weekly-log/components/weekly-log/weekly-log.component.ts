import { Component, OnInit, OnDestroy, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { getLocalDateString } from '../../../../utils/smartParser';

@Component({
  selector: 'app-weekly-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col max-w-5xl mx-auto w-full pb-20 animate-fade-in">
      
      <!-- Cabeçalho & Navegação da Semana -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-stone-800 pb-4 mb-6 gap-4">
        <div>
          <h1 class="text-3xl sm:text-4xl font-serif text-stone-900 font-bold italic tracking-tight">Log Semanal</h1>
          <p class="text-sm text-stone-500 font-mono mt-1 uppercase tracking-widest">Plano & Avaliação de Ritmo</p>
        </div>
        
        <div class="flex items-center gap-2 bg-stone-100 p-1 rounded border border-stone-200 shadow-sm self-start sm:self-auto">
          <button (click)="navigateWeek(-1)" class="p-1.5 rounded hover:bg-stone-200 transition-colors text-stone-600" title="Semana Anterior">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span class="text-xs font-mono font-bold px-3 text-stone-800 whitespace-nowrap">
            {{ formatDateRange() }}
          </span>
          <button (click)="navigateWeek(1)" class="p-1.5 rounded hover:bg-stone-200 transition-colors text-stone-600" title="Próxima Semana">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          
          <button *ngIf="!isCurrentWeek()" (click)="goToCurrentWeek()" class="ml-2 p-1 px-2.5 rounded bg-stone-800 text-stone-100 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-stone-700">
            Hoje
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        <!-- Lado Esquerdo: 7 dias -->
        <div class="xl:col-span-8 flex flex-col space-y-4">
          <div class="text-sm font-bold text-stone-500 uppercase tracking-widest border-b border-stone-200 pb-2">
            Tarefas & Eventos Agendados
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 flex-1 content-start">
            <div *ngFor="let day of weekDays" 
                 (click)="openDay(day)"
                 class="p-4 rounded-xl border border-stone-200 text-left cursor-pointer transition-all flex flex-col justify-between hover:border-stone-400 bg-white shadow-sm"
                 [class.ring-2]="isToday(day)" [class.ring-amber-400]="isToday(day)" [class.bg-amber-50]="isToday(day)">
              
              <div>
                <div class="flex justify-between items-baseline mb-3 border-b border-stone-100 pb-2">
                  <span class="text-xs font-bold uppercase tracking-wider" [class.text-amber-700]="isToday(day)" [class.text-stone-500]="!isToday(day)">
                    {{ formatDayName(day) }}
                  </span>
                  <span class="text-2xl font-serif font-bold tracking-tight text-stone-800">
                    {{ formatDayNumber(day) }}
                  </span>
                </div>

                <div class="space-y-2 mb-4">
                  <ng-container *ngFor="let item of getDayItems(day).slice(0, 4)">
                    <div class="flex items-start gap-2 text-xs text-stone-600">
                      <span class="font-mono mt-0.5 shrink-0 cursor-default bujo-tooltip" [attr.data-tooltip]="getStatusTooltip(item)" [class.text-stone-300]="item.status === 'completed'" [class.text-stone-600]="item.status !== 'completed'">
                        {{ getSymbol(item) }}
                      </span>
                      <span class="truncate leading-tight" [class.line-through]="item.status === 'completed'" [class.text-stone-400]="item.status === 'completed'">
                        {{ item.content }}
                      </span>
                    </div>
                  </ng-container>
                  
                  <div *ngIf="getDayItems(day).length === 0" class="text-xs text-stone-400 italic py-2">
                    Livre...
                  </div>

                  <div *ngIf="getDayItems(day).length > 4" class="text-[10px] font-bold text-stone-400 mt-2">
                    +{{ getDayItems(day).length - 4 }} itens
                  </div>
                </div>
              </div>

              <div class="text-[10px] font-bold text-stone-400 hover:text-stone-800 uppercase tracking-widest mt-auto self-start flex items-center gap-1 transition-colors">
                Abrir Dia →
              </div>
            </div>
          </div>
        </div>

        <!-- Lado Direito: Retrospectiva -->
        <div class="xl:col-span-4 p-6 rounded-xl bg-stone-100 border border-stone-200 flex flex-col justify-between shadow-sm">
          <div class="space-y-4 flex-1 flex flex-col">
            <div class="text-sm font-bold text-stone-800 font-serif italic border-b border-stone-200 pb-2">
              Retrospectiva Semanal
            </div>
            
            <p class="text-xs text-stone-600 leading-relaxed mb-2">
              O Bullet Journal preza por auto-compaixão. Reserve 5 minutos para olhar a semana passada sem julgamentos. Como foi o foco? O que causou fricção?
            </p>

            <textarea
              [(ngModel)]="weeklyReview"
              (ngModelChange)="saveReview($event)"
              placeholder="O que funcionou melhor essa semana? Onde encontrei fricção? Como adaptar meu ritmo de energia na próxima semana? (Salva automaticamente)..."
              class="w-full flex-1 min-h-[250px] bg-white border border-stone-200 rounded p-4 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 resize-none transition-all content-scroll"
            ></textarea>
          </div>

          <div class="mt-6 p-4 rounded bg-amber-100/50 border border-amber-200 text-xs text-stone-700 flex items-start gap-3">
            <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span class="leading-relaxed">
              <strong>Dica de Ritmo:</strong> Se esta semana foi difícil, experimente reduzir a quantidade de tarefas prioritárias (máximo de 3) na próxima!
            </span>
          </div>
        </div>

      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class WeeklyLogComponent implements OnInit, OnDestroy {
  @Output() tabChange = new EventEmitter<string>();
  
  items: BujoItem[] = [];
  selectedDate: string = '';
  weekDays: string[] = [];
  weeklyReview = '';
  
  private sub?: Subscription;
  private dateSub?: Subscription;

  constructor(private bujoService: BujoService) {}

  ngOnInit() {
    this.sub = this.bujoService.items$.subscribe(items => {
      this.items = items;
    });
    this.dateSub = this.bujoService.selectedDate$.subscribe(date => {
      this.selectedDate = date;
      this.updateWeekDays();
      this.loadReview();
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.dateSub) this.dateSub.unsubscribe();
  }

  updateWeekDays() {
    if (!this.selectedDate) return;
    const baseDate = new Date(this.selectedDate + 'T00:00:00');
    const day = baseDate.getDay();
    // Segunda-feira (1) é o começo
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(baseDate.setDate(diff));
    
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    this.weekDays = days;
  }

  formatDateRange(): string {
    if (!this.weekDays.length) return '';
    const start = new Date(this.weekDays[0] + 'T00:00:00');
    const end = new Date(this.weekDays[6] + 'T00:00:00');
    
    // PT-BR formatting
    const m1 = start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const m2 = end.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    
    return `${start.getDate()} ${m1} - ${end.getDate()} ${m2}, ${start.getFullYear()}`;
  }

  formatDayName(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  }

  formatDayNumber(dateStr: string): number {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDate();
  }

  isToday(dateStr: string): boolean {
    return dateStr === getLocalDateString();
  }

  isCurrentWeek(): boolean {
    return this.weekDays.includes(getLocalDateString());
  }

  navigateWeek(delta: number) {
    if (!this.selectedDate) return;
    const d = new Date(this.selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + (delta * 7));
    this.bujoService.setSelectedDate(d.toISOString().split('T')[0]);
  }

  goToCurrentWeek() {
    this.bujoService.setSelectedDate(getLocalDateString());
  }

  getDayItems(dayStr: string): BujoItem[] {
    return this.items.filter(item => item.date === dayStr && item.status !== 'cancelled');
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
    if (!this.weekDays.length) return;
    const saved = localStorage.getItem(`bujo_weekly_review_${this.weekDays[0]}`);
    this.weeklyReview = saved || '';
  }

  saveReview(val: string) {
    if (!this.weekDays.length) return;
    localStorage.setItem(`bujo_weekly_review_${this.weekDays[0]}`, val);
  }

  openDay(dayStr: string) {
    this.bujoService.setSelectedDate(dayStr);
    this.tabChange.emit('daily');
  }
}
