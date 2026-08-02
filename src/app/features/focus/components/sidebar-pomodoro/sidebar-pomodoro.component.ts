import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { NotificationService } from '../../../../services/notification.service';

export interface PomodoroConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakAfter: number;
}

@Component({
  selector: 'app-sidebar-pomodoro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar-pomodoro.component.html',
  styleUrls: ['./sidebar-pomodoro.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarPomodoroComponent implements OnInit, OnDestroy {
  isExpanded = true;
  mode: 'focus' | 'short_break' | 'long_break' = 'focus';
  timerState: 'idle' | 'running' | 'paused' = 'idle';

  config: PomodoroConfig = {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakAfter: 4
  };

  timeLeft = 25 * 60;
  totalTime = 25 * 60;
  sessionCount = 0; // Completed sessions out of 4

  settingsOpen = false;
  taskDropdownOpen = false;
  taskSearchQuery = '';

  availableTasks: BujoItem[] = [];
  associatedTaskId: string | null = null;
  associatedTaskIndex = 0;

  private timerInterval: any = null;
  private itemsSub?: Subscription;

  constructor(
    private bujoService: BujoService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private eRef: ElementRef
  ) {}

  ngOnInit() {
    this.loadConfig();
    this.loadState();

    this.itemsSub = this.bujoService.items$.subscribe(items => {
      // Filter for active/todo tasks
      this.availableTasks = items.filter(i => i.type === 'task' && i.status !== 'completed' && i.status !== 'cancelled');
      if (this.availableTasks.length > 0) {
        if (!this.associatedTaskId || !this.availableTasks.some(t => t.id === this.associatedTaskId)) {
          this.associatedTaskId = this.availableTasks[0].id;
          this.associatedTaskIndex = 0;
        } else {
          this.associatedTaskIndex = this.availableTasks.findIndex(t => t.id === this.associatedTaskId);
        }
      } else {
        this.associatedTaskId = null;
        this.associatedTaskIndex = 0;
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.syncActiveTaskTime();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.itemsSub) {
      this.itemsSub.unsubscribe();
    }
    this.saveState();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: any) {
    if (this.taskDropdownOpen) {
      this.taskDropdownOpen = false;
      this.cdr.markForCheck();
    }
    if (this.settingsOpen) {
      this.settingsOpen = false;
      this.cdr.markForCheck();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    if (this.taskDropdownOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.taskDropdownOpen = false;
      this.cdr.markForCheck();
    }
  }

  get filteredTasks(): BujoItem[] {
    if (!this.taskSearchQuery.trim()) return this.availableTasks;
    const q = this.taskSearchQuery.toLowerCase();
    return this.availableTasks.filter(t => t.content.toLowerCase().includes(q));
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.saveState();
  }

  toggleTaskDropdown() {
    this.taskDropdownOpen = !this.taskDropdownOpen;
    if (this.taskDropdownOpen) {
      this.taskSearchQuery = '';
    }
    this.cdr.markForCheck();
  }

  selectTask(taskId: string | null) {
    // Sincroniza a tarefa anterior antes de mudar a seleção
    this.syncActiveTaskTime();

    this.associatedTaskId = taskId;
    if (taskId) {
      this.associatedTaskIndex = this.availableTasks.findIndex(t => t.id === taskId);
    }
    this.taskDropdownOpen = false;
    this.cdr.markForCheck();
  }

  startTimer() {
    if (this.timerState === 'running') return;
    this.timerState = 'running';

    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;

        // Se estiver rodando no modo FOCO e houver tarefa associada, atualiza em TEMPO REAL (a cada segundo)!
        if (this.mode === 'focus' && this.associatedTaskId) {
          const task = this.availableTasks.find(t => t.id === this.associatedTaskId);
          if (task) {
            const currentSeconds = (task as any).timeSpentSeconds || 0;
            const newSeconds = currentSeconds + 1;
            (task as any).timeSpentSeconds = newSeconds;

            // Atualiza em tempo real no bujoService para refletir instantaneamente no Daily Log / Agenda
            this.bujoService.updateItem(task.id, {
              timeSpentSeconds: newSeconds
            } as any);
          }
        }

        this.cdr.markForCheck();
        this.saveState();
      } else {
        this.onTimerComplete();
      }
    }, 1000);
  }

  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerState = 'paused';

    // Sincroniza o tempo acumulado exato na tarefa ao pausar
    this.syncActiveTaskTime();

    this.cdr.markForCheck();
    this.saveState();
  }

  resetTimer() {
    this.syncActiveTaskTime();
    this.pauseTimer();
    this.timerState = 'idle';
    this.setTimeForCurrentMode();
    this.cdr.markForCheck();
    this.saveState();
  }

  switchMode(newMode: 'focus' | 'short_break' | 'long_break') {
    this.syncActiveTaskTime();
    this.pauseTimer();
    this.mode = newMode;
    this.timerState = 'idle';
    this.setTimeForCurrentMode();
    this.cdr.markForCheck();
    this.saveState();
  }

  private syncActiveTaskTime() {
    if (!this.associatedTaskId) return;
    const task = this.availableTasks.find(t => t.id === this.associatedTaskId);
    if (task && (task as any).timeSpentSeconds !== undefined) {
      this.bujoService.updateItem(task.id, {
        timeSpentSeconds: (task as any).timeSpentSeconds,
        pomodoroCount: (task as any).pomodoroCount || 0
      } as any);
    }
  }

  private setTimeForCurrentMode() {
    if (this.mode === 'focus') {
      this.totalTime = this.config.focusMinutes * 60;
    } else if (this.mode === 'short_break') {
      this.totalTime = this.config.shortBreakMinutes * 60;
    } else if (this.mode === 'long_break') {
      this.totalTime = this.config.longBreakMinutes * 60;
    }
    this.timeLeft = this.totalTime;
  }

  private onTimerComplete() {
    this.pauseTimer();
    this.playNotificationSound();

    if (this.mode === 'focus') {
      this.sessionCount++;
      // Increment task pomodoro count and save final time spent
      if (this.associatedTaskId) {
        const task = this.availableTasks.find(t => t.id === this.associatedTaskId);
        if (task) {
          const currentCount = (task as any).pomodoroCount || 0;
          const timeSpent = (task as any).timeSpentSeconds || 0;
          (task as any).pomodoroCount = currentCount + 1;
          this.bujoService.updateItem(task.id, {
            pomodoroCount: currentCount + 1,
            timeSpentSeconds: timeSpent
          } as any);
        }
      }

      this.notificationService.sendCustomNotification(
        'Sessão de Foco Concluída! 🍅',
        `Parabéns! Você completou um ciclo de foco. Hora de uma pausa!`
      );

      // Determine next break mode
      if (this.sessionCount >= this.config.longBreakAfter) {
        this.sessionCount = 0;
        this.switchMode('long_break');
      } else {
        this.switchMode('short_break');
      }
    } else {
      this.notificationService.sendCustomNotification(
        'Pausa Concluída! ⚡',
        `Sua pausa terminou. Pronto para focar novamente?`
      );
      this.switchMode('focus');
    }
  }

  getAssociatedTaskName(): string {
    if (!this.associatedTaskId || this.availableTasks.length === 0) {
      return 'Nenhuma tarefa (Timer livre)';
    }
    const task = this.availableTasks.find(t => t.id === this.associatedTaskId);
    return task ? task.content : 'Selecionar Tarefa';
  }

  getAssociatedTaskTimeSpent(): string {
    if (!this.associatedTaskId || this.availableTasks.length === 0) return '';
    const task = this.availableTasks.find(t => t.id === this.associatedTaskId);
    if (!task) return '';
    const seconds = (task as any).timeSpentSeconds || 0;
    return this.formatTimeSpent(seconds);
  }

  getAssociatedTaskPomoCount(): number {
    if (!this.associatedTaskId || this.availableTasks.length === 0) return 0;
    const task = this.availableTasks.find(t => t.id === this.associatedTaskId);
    return task ? ((task as any).pomodoroCount || 0) : 0;
  }

  formatTimeSpent(seconds: number = 0): string {
    if (!seconds || seconds <= 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) {
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
  }

  getModeLabel(): string {
    if (this.mode === 'focus') return 'FOCO';
    if (this.mode === 'short_break') return 'PAUSA CURTA';
    return 'PAUSA LONGA';
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getProgressOffset(): number {
    const radius = 48;
    const circumference = 2 * Math.PI * radius; // ~301.59
    if (this.totalTime <= 0) return 0;
    const progress = (this.totalTime - this.timeLeft) / this.totalTime;
    return circumference * (1 - progress);
  }

  getProgressPercent(): number {
    if (this.totalTime <= 0) return 0;
    return ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
  }

  openSettings() {
    this.settingsOpen = true;
  }

  closeSettings() {
    this.settingsOpen = false;
  }

  adjustConfig(key: keyof PomodoroConfig, delta: number) {
    if (key === 'longBreakAfter') {
      this.config[key] = Math.max(1, Math.min(10, this.config[key] + delta));
    } else {
      this.config[key] = Math.max(1, Math.min(120, this.config[key] + delta));
    }
    this.saveConfig();
    this.resetTimer();
  }

  private loadConfig() {
    if (typeof localStorage === 'undefined') return;
    const saved = localStorage.getItem('bujo_pomodoro_config');
    if (saved) {
      try {
        this.config = { ...this.config, ...JSON.parse(saved) };
      } catch (e) {}
    }
  }

  private saveConfig() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('bujo_pomodoro_config', JSON.stringify(this.config));
  }

  private loadState() {
    if (typeof localStorage === 'undefined') return;
    const saved = localStorage.getItem('bujo_pomodoro_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.isExpanded = state.isExpanded ?? true;
        this.mode = state.mode || 'focus';
        this.sessionCount = state.sessionCount || 0;
        this.setTimeForCurrentMode();
      } catch (e) {}
    }
  }

  private saveState() {
    if (typeof localStorage === 'undefined') return;
    const state = {
      isExpanded: this.isExpanded,
      mode: this.mode,
      sessionCount: this.sessionCount
    };
    localStorage.setItem('bujo_pomodoro_state', JSON.stringify(state));
  }

  private playNotificationSound() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }
}
