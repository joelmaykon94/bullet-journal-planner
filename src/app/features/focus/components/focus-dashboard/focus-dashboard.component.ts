import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { getLocalDateString } from '../../../../utils/smartParser';

@Component({
  selector: 'app-focus-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './focus-dashboard.component.html',
  styleUrls: ['./focus-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FocusDashboardComponent implements OnInit, OnDestroy {
  todayItems: BujoItem[] = [];
  isTaskListOpen = true;
  activeTaskId: string | null = null;
  private sub?: Subscription;

  mode: 'focus' | 'short_break' | 'long_break' = 'focus';
  timerState: 'idle' | 'running' | 'paused' = 'idle';
  timeLeft = 25 * 60;
  totalTime = 25 * 60;
  sessionCount = 0;
  private timerInterval: any = null;

  config = {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakAfter: 4
  };

  currentTime: Date = new Date();
  private clockInterval: any = null;

  constructor(private bujoService: BujoService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadState();
    
    this.sub = this.bujoService.items$.subscribe(items => {
      const today = getLocalDateString(new Date());
      this.todayItems = items.filter(i => 
        i.date === today && 
        i.type === 'task' && 
        i.status !== 'completed' && 
        i.status !== 'cancelled'
      );
      
      // Auto-select first task if none selected
      if (!this.activeTaskId && this.todayItems.length > 0) {
        this.activeTaskId = this.todayItems[0].id;
      } else if (this.activeTaskId && !this.todayItems.find(i => i.id === this.activeTaskId)) {
        this.activeTaskId = this.todayItems.length > 0 ? this.todayItems[0].id : null;
      }
    });

    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
      this.updateClockStrings();
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    this.syncActiveTaskTime();
    if (this.sub) this.sub.unsubscribe();
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.saveState();
  }

  currentFormattedDateStr: string = '';
  currentFormattedTimeStr: string = '';
  isAm: boolean = true;

  // --- UI Helpers ---
  get formatTimeLeft(): string {
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  private updateClockStrings() {
    const d = this.currentTime;
    
    // Date
    const ptMonths = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const ptDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    this.currentFormattedDateStr = `${ptDays[d.getDay()]}, ${d.getDate()} de ${ptMonths[d.getMonth()]}`;

    // Time
    let h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();
    this.isAm = d.getHours() < 12;
    h = h % 12;
    h = h ? h : 12;
    this.currentFormattedTimeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // --- Core Pomodoro Logic ---
  startTimer() {
    if (this.timerState === 'running') return;
    this.timerState = 'running';
    this.waitingForNextAction = false;

    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;

        if (this.mode === 'focus' && this.activeTaskId) {
          const task = this.todayItems.find(t => t.id === this.activeTaskId);
          if (task) {
            const currentSeconds = (task as any).timeSpentSeconds || 0;
            const newSeconds = currentSeconds + 1;
            (task as any).timeSpentSeconds = newSeconds;
            this.bujoService.updateItem(task.id, { timeSpentSeconds: newSeconds } as any);
          }
        }
        this.saveState();
        this.cdr.detectChanges();
      } else {
        this.onTimerComplete();
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerState = 'paused';
    this.syncActiveTaskTime();
    this.saveState();
  }

  toggleTimer() {
    if (this.timerState === 'running') {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  resetTimer() {
    this.syncActiveTaskTime();
    this.pauseTimer();
    this.timerState = 'idle';
    this.setTimeForCurrentMode();
    this.saveState();
  }

  switchMode(newMode: 'focus' | 'short_break' | 'long_break') {
    this.syncActiveTaskTime();
    this.pauseTimer();
    this.mode = newMode;
    this.timerState = 'idle';
    this.setTimeForCurrentMode();
    this.saveState();
  }

  private setTimeForCurrentMode() {
    if (this.mode === 'focus') this.totalTime = this.config.focusMinutes * 60;
    else if (this.mode === 'short_break') this.totalTime = this.config.shortBreakMinutes * 60;
    else if (this.mode === 'long_break') this.totalTime = this.config.longBreakMinutes * 60;
    this.timeLeft = this.totalTime;
  }

  private onTimerComplete() {
    this.pauseTimer();
    
    if (this.mode === 'focus') {
      this.sessionCount++;
      if (this.activeTaskId) {
        const task = this.todayItems.find(t => t.id === this.activeTaskId);
        if (task) {
          const currentCount = (task as any).pomodoroCount || 0;
          (task as any).pomodoroCount = currentCount + 1;
          this.bujoService.updateItem(task.id, { 
            pomodoroCount: currentCount + 1,
            timeSpentSeconds: (task as any).timeSpentSeconds || 0
          } as any);
        }
      }
      
      if (this.sessionCount % this.config.longBreakAfter === 0) {
        this.switchMode('long_break');
      } else {
        this.switchMode('short_break');
      }
    } else {
      this.switchMode('focus');
    }
  }

  private syncActiveTaskTime() {
    if (!this.activeTaskId) return;
    const task = this.todayItems.find(t => t.id === this.activeTaskId);
    if (task && (task as any).timeSpentSeconds !== undefined) {
      this.bujoService.updateItem(task.id, {
        timeSpentSeconds: (task as any).timeSpentSeconds,
        pomodoroCount: (task as any).pomodoroCount || 0
      } as any);
    }
  }

  private loadState() {
    const saved = localStorage.getItem('bujo_focus_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.mode = state.mode || 'focus';
        this.sessionCount = state.sessionCount || 0;
        this.activeTaskId = state.activeTaskId || null;
        
        let loadedTimeLeft = state.timeLeft || (this.config.focusMinutes * 60);
        const savedTimerState = state.timerState || 'idle';

        if (savedTimerState === 'running' && state.lastSavedTime) {
          const elapsedSeconds = Math.floor((Date.now() - state.lastSavedTime) / 1000);
          const actualElapsed = Math.min(elapsedSeconds, loadedTimeLeft); // Don't subtract more than what was left
          loadedTimeLeft = Math.max(0, loadedTimeLeft - actualElapsed);
          
          if (this.mode === 'focus' && this.activeTaskId) {
            const task = this.todayItems.find(t => t.id === this.activeTaskId);
            if (task) {
              const currentSeconds = (task as any).timeSpentSeconds || 0;
              const newSeconds = currentSeconds + actualElapsed;
              (task as any).timeSpentSeconds = newSeconds;
              this.bujoService.updateItem(task.id, { timeSpentSeconds: newSeconds } as any);
            }
          }
        }
        
        this.timeLeft = loadedTimeLeft;
        this.timerState = savedTimerState;

        if (this.timerState === 'running') {
          // Temporarily set to idle so startTimer will initiate the interval
          this.timerState = 'idle';
          this.startTimer();
        }
      } catch (e) {}
    } else {
      this.setTimeForCurrentMode();
    }
    this.updateClockStrings();
  }

  private saveState() {
    const state = {
      mode: this.mode,
      timeLeft: this.timeLeft,
      sessionCount: this.sessionCount,
      timerState: this.timerState,
      activeTaskId: this.activeTaskId,
      lastSavedTime: Date.now()
    };
    localStorage.setItem('bujo_focus_state', JSON.stringify(state));
  }

  showCompleteModal = false;
  taskToCompleteId: string | null = null;
  waitingForNextAction = false;

  askCompleteTask(taskId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.taskToCompleteId = taskId;
    this.showCompleteModal = true;
  }

  cancelCompleteTask() {
    this.showCompleteModal = false;
    this.taskToCompleteId = null;
  }

  confirmCompleteTask() {
    if (this.taskToCompleteId) {
      this.bujoService.updateItem(this.taskToCompleteId, { status: 'completed' });
      this.pauseTimer();
      this.waitingForNextAction = true;
      
      // Select another task if the active one was completed
      if (this.activeTaskId === this.taskToCompleteId) {
        this.activeTaskId = null; // Will auto-select next in the observable if needed, or leave null
      }
    }
    this.showCompleteModal = false;
    this.taskToCompleteId = null;
    this.saveState();
  }

  toggleTaskList() {
    this.isTaskListOpen = !this.isTaskListOpen;
  }

  setActiveTask(id: string) {
    this.syncActiveTaskTime();
    this.activeTaskId = id;
    this.waitingForNextAction = false;
    this.saveState();
  }

  get activeTask(): BujoItem | undefined {
    return this.todayItems.find(i => i.id === this.activeTaskId);
  }
}
// trigger rebuild
// touch 1786448001
