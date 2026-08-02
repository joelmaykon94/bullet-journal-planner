import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService } from '../../../../services/bujo.service';
import { SyncStatusService } from '../../../../services/sync-status.service';

@Component({
  selector: 'app-habit-tracker-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habit-tracker-matrix.component.html',
  styleUrls: []
})
export class HabitTrackerMatrixComponent implements OnInit, OnDestroy {
  @Input() selectedDate: string = '';

  habits: string[] = [];
  showAddInput = false;
  newHabitName = '';

  private habitsSub?: Subscription;
  private logsSub?: Subscription;

  constructor(
    private bujoService: BujoService,
    private syncStatusService: SyncStatusService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.habitsSub = this.bujoService.habits$.subscribe(habits => {
      this.habits = this.bujoService.getHabits();
      this.cdr.markForCheck();
    });

    this.logsSub = this.bujoService.habitLogs$.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.habitsSub) this.habitsSub.unsubscribe();
    if (this.logsSub) this.logsSub.unsubscribe();
  }

  isCompleted(habit: string): boolean {
    if (!this.selectedDate) return false;
    return this.bujoService.isHabitCompleted(this.selectedDate, habit);
  }

  toggleHabit(habit: string) {
    if (!this.selectedDate) return;
    const isDone = this.bujoService.toggleHabitForDate(this.selectedDate, habit);
    if (isDone) {
      this.syncStatusService.showToast({
        type: 'success',
        message: `✓ Hábito concluído: ${habit}!`
      });
    }
  }

  addHabit() {
    const val = this.newHabitName.trim();
    if (!val) return;

    this.bujoService.addHabit(val);
    this.syncStatusService.showToast({
      type: 'success',
      message: `✨ Novo hábito adicionado à régua: ${val}`
    });

    this.newHabitName = '';
    this.showAddInput = false;
  }

  removeHabit(habit: string, event: Event) {
    event.stopPropagation();
    this.bujoService.removeHabit(habit);
    this.syncStatusService.showToast({
      type: 'offline',
      message: `🗑️ Hábito removido da régua.`
    });
  }

  getCompletedCount(): number {
    return this.habits.filter(h => this.isCompleted(h)).length;
  }
}
