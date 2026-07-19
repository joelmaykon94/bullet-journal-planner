import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { BulletItemComponent } from '../../../daily-log/components/bullet-item/bullet-item.component';

@Component({
  selector: 'app-future-log',
  standalone: true,
  imports: [CommonModule, FormsModule, BulletItemComponent],
  templateUrl: './future-log.component.html',
  styleUrls: ['./future-log.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FutureLogComponent implements OnInit, OnDestroy {
  months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  selectedMonth = new Date().getMonth();
  
  items: BujoItem[] = [];
  private sub?: Subscription;

  inputText = '';
  inputType: 'task' | 'event' | 'note' = 'event';
  inputTime = '';
  energy = 1;
  complexity = 1;
  executionTime = '';

  constructor(private bujoService: BujoService) {}

  ngOnInit() {
    this.sub = this.bujoService.items$.subscribe((data: BujoItem[]) => {
      this.items = data;
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  getMonthEvents(monthIndex: number): BujoItem[] {
    return this.items.filter(item => {
      if (!item.date || item.date === 'someday_maybe') return false;
      const dateMonth = new Date(item.date + 'T00:00:00').getMonth();
      return dateMonth === monthIndex;
    });
  }

  get currentMonthEvents(): BujoItem[] {
    return this.getMonthEvents(this.selectedMonth);
  }

  get scheduledEvents(): BujoItem[] {
    return this.currentMonthEvents.filter(item => item.status !== 'completed');
  }

  get completedEvents(): BujoItem[] {
    return this.currentMonthEvents.filter(item => item.status === 'completed');
  }

  getScheduledCount(monthIndex: number): number {
    return this.getMonthEvents(monthIndex).filter(i => i.status !== 'completed').length;
  }

  getCompletedCount(monthIndex: number): number {
    return this.getMonthEvents(monthIndex).filter(i => i.status === 'completed').length;
  }

  handleLocalSubmit(e: Event) {
    e.preventDefault();
    if (!this.inputText.trim()) return;

    // Create a date for the selected month (e.g., first day of the month)
    const currentYear = new Date().getFullYear();
    const dateStr = `${currentYear}-${String(this.selectedMonth + 1).padStart(2, '0')}-01`;

    const newItem: Partial<BujoItem> = {
      content: this.inputText,
      type: this.inputType,
      status: 'todo',
      date: dateStr,
      time: this.inputTime || undefined,
      energy: this.inputType === 'task' ? this.energy : undefined,
      complexity: this.inputType === 'task' ? this.complexity : undefined,
    };

    this.bujoService.addItem(newItem);
    
    // Reset form
    this.inputText = '';
    this.energy = 1;
    this.complexity = 1;
    this.executionTime = '';
    this.inputTime = '';
  }
}
