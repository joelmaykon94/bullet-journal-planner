import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../services/bujo.service';
import { getLocalDateString } from '../../../utils/smartParser';

@Component({
  selector: 'app-calendar-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col space-y-4 bg-white rounded-xl shadow-sm border border-stone-200 p-4">
      
      <!-- Cabeçalho do Calendário -->
      <div class="flex items-center justify-between pb-3 border-b border-stone-100">
        <div class="flex flex-col">
          <span class="text-xs font-mono font-bold text-stone-800 uppercase tracking-widest">{{ getMonthName() }}</span>
          <span class="text-[10px] font-mono text-stone-500">{{ currentYearMonth.year }}</span>
        </div>
        
        <div class="flex items-center gap-1">
          <button (click)="navigateMonth(-1)" class="p-1 rounded-md hover:bg-stone-100 text-stone-600 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <button *ngIf="!isCurrentMonth()" (click)="goToCurrentMonth()" class="mx-1 px-2 py-0.5 rounded bg-stone-800 text-stone-100 text-[9px] font-bold uppercase tracking-wider hover:bg-stone-700 transition-colors">
            Hoje
          </button>
          
          <button (click)="navigateMonth(1)" class="p-1 rounded-md hover:bg-stone-100 text-stone-600 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <!-- Cabeçalho dos Dias -->
      <div class="grid grid-cols-7 gap-1 text-center font-mono text-[9px] font-bold text-stone-400 uppercase tracking-widest pb-1">
        <span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span><span>D</span>
      </div>

      <!-- Grid do Calendário -->
      <div class="grid grid-cols-7 gap-1 sm:gap-1.5">
        <ng-container *ngFor="let day of calendarDays">
          <!-- Célula Vazia -->
          <div *ngIf="day === null" class="aspect-square bg-transparent"></div>
          
          <!-- Célula do Dia -->
          <div *ngIf="day !== null"
               (click)="selectDate(day)"
               class="aspect-square p-1 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all hover:border-stone-400 group relative"
               [class.bg-white]="day !== selectedDate"
               [class.border-stone-100]="day !== selectedDate"
               [class.bg-stone-800]="day === selectedDate"
               [class.text-stone-100]="day === selectedDate"
               [class.shadow-sm]="day === selectedDate"
               [class.ring-1]="isToday(day)" [class.ring-amber-400]="isToday(day)" [class.border-amber-400]="isToday(day)">
            
            <span class="text-[10px] font-mono font-bold" [class.text-amber-600]="isToday(day) && day !== selectedDate" [class.text-stone-500]="day !== selectedDate && !isToday(day)">
              {{ getDayNumber(day) }}
            </span>

            <div class="flex gap-0.5 mt-0.5">
              <span *ngIf="hasEvents(day)" class="w-1 h-1 rounded-full bg-stone-400" [class.bg-stone-300]="day === selectedDate"></span>
              <span *ngIf="hasTasks(day)" class="w-1 h-1 rounded-full" [ngClass]="hasUncompleted(day) ? 'bg-amber-500' : 'bg-emerald-500'"></span>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class CalendarWidgetComponent implements OnInit, OnDestroy {
  items: BujoItem[] = [];
  selectedDate: string = '';
  
  currentYearMonth = { year: new Date().getFullYear(), month: new Date().getMonth() };
  calendarDays: (string | null)[] = [];
  
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
        if (this.currentYearMonth.year !== parseInt(y) || this.currentYearMonth.month !== parseInt(m) - 1) {
            this.currentYearMonth = { year: parseInt(y), month: parseInt(m) - 1 };
        }
        this.updateCalendarDays();
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
    
    let firstDayIndex = date.getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      const d = new Date(date);
      const dayStr = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      days.push(dayStr);
      date.setDate(date.getDate() + 1);
    }

    this.calendarDays = days;
  }

  getMonthName(): string {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[this.currentYearMonth.month];
  }

  getDayNumber(dateStr: string): string {
    const [, , d] = dateStr.split('-');
    return d;
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
    
    const newDateStr = `${newYear}-${(newMonth+1).toString().padStart(2, '0')}-01`;
    this.bujoService.setSelectedDate(newDateStr);
  }

  goToCurrentMonth() {
    this.bujoService.setSelectedDate(getLocalDateString());
  }
  
  selectDate(dayStr: string) {
    this.bujoService.setSelectedDate(dayStr);
  }

  hasEvents(dayStr: string): boolean {
    return this.items.some(i => i.date === dayStr && i.type === 'event' && i.status !== 'cancelled');
  }
  hasTasks(dayStr: string): boolean {
    return this.items.some(i => i.date === dayStr && i.type === 'task' && i.status !== 'cancelled');
  }
  hasUncompleted(dayStr: string): boolean {
    return this.items.some(i => i.date === dayStr && i.type === 'task' && i.status !== 'completed' && i.status !== 'cancelled');
  }
}

