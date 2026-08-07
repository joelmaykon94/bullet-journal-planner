import { Component, signal, OnInit, HostListener, ViewEncapsulation, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { DailyLogComponent } from './features/daily-log/components/daily-log/daily-log.component';
import { TrashComponent } from './features/trash/components/trash/trash.component';
import { TimelineComponent } from './features/timeline/components/timeline/timeline.component';
import { WeeklyLogComponent } from './features/weekly-log/components/weekly-log/weekly-log.component';
import { MonthlyLogComponent } from './features/monthly-log/components/monthly-log/monthly-log.component';
import { WeatherService } from './features/weather/services/weather.service';
import { CollectionsLibraryComponent } from './features/collections/components/collections-library/collections-library.component';
import { BudgetPlannerComponent } from './features/budget/components/budget-planner/budget-planner.component';
import { FutureLogComponent } from './features/future-log/components/future-log/future-log.component';
import { DreamBoardComponent } from './features/dreams/components/dream-board/dream-board.component';
import { SidebarPomodoroComponent } from './features/focus/components/sidebar-pomodoro/sidebar-pomodoro.component';
import { SettingsComponent } from './features/settings/components/settings/settings.component';
import { AuthScreenComponent } from './features/auth/components/auth-screen/auth-screen.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { InboxViewComponent } from './features/inbox/components/inbox-view/inbox-view.component';
import { QuickCaptureModalComponent } from './features/inbox/components/quick-capture-modal/quick-capture-modal.component';
import { DelegatesPanelComponent } from './features/delegates/components/delegates-panel/delegates-panel.component';
import { RecurringTasksModalComponent } from './features/daily-log/components/recurring-tasks-modal/recurring-tasks-modal.component';
import { SomedayMaybeViewComponent } from './features/someday/components/someday-maybe-view/someday-maybe-view.component';
import { NotificationService, AppNotification } from './services/notification.service';
import { BujoService } from './services/bujo.service';
import { AuthService } from './services/auth.service';
import { ModalService } from './services/modal.service';
import { environment } from '../environments/version';

import { SyncStatusService } from './services/sync-status.service';

export type TabId = 'dashboard' | 'inbox' | 'delegates' | 'someday' | 'daily' | 'weekly' | 'monthly' | 'timeline' | 'budget' | 'collections' | 'dream_board' | 'future_log' | 'focus' | 'settings' | 'trash';

interface Tab {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: string;
}

interface LocalWeather {
  city: string;
  temp: number;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, DashboardComponent, DailyLogComponent, TrashComponent, TimelineComponent,
    WeeklyLogComponent, MonthlyLogComponent, CollectionsLibraryComponent, BudgetPlannerComponent,
    FutureLogComponent, DreamBoardComponent, SettingsComponent, AuthScreenComponent, ModalComponent,
    SidebarPomodoroComponent, InboxViewComponent, QuickCaptureModalComponent, DelegatesPanelComponent,
    RecurringTasksModalComponent, SomedayMaybeViewComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None
})
export class App implements OnInit {
  @ViewChild(QuickCaptureModalComponent) quickCaptureModal!: QuickCaptureModalComponent;
  @ViewChild(RecurringTasksModalComponent) recurringTasksModal!: RecurringTasksModalComponent;

  openRecurringTasksModal() {
    if (this.recurringTasksModal) {
      this.recurringTasksModal.isOpen = true;
    }
  }

  private readonly weatherService = inject(WeatherService);
  public readonly notificationService = inject(NotificationService);
  public readonly bujoService = inject(BujoService);
  public readonly authService = inject(AuthService);
  public readonly modalService = inject(ModalService);
  public readonly syncStatusService = inject(SyncStatusService);
  protected readonly title = signal('BuJo Focus');

  manualSync() {
    const user = this.authService.currentUser;
    if (user && user.id && user.id !== 'anonymous-user-id') {
      this.authService.syncLocalToCloud(user.id, false, true);
    } else {
      this.syncStatusService.showToast({ type: 'offline', message: 'Você está no Modo Offline.' });
    }
  }

  activeTab = signal<TabId>((typeof localStorage !== 'undefined' && localStorage.getItem('bujo_active_tab') as TabId) || 'dashboard');
  sidebarOpen = signal(false);
  desktopNotificationsOpen = signal(false);
  mobileNotificationsOpen = signal(false);
  userMenuOpen = signal(false);
  isDark = signal<boolean>(
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem('bujo_theme') ? localStorage.getItem('bujo_theme') === 'dark' : true)
      : true
  );
  currentTime = signal(new Date());
  appVersion = environment.version;

  localWeather = signal<LocalWeather | null>(null);

  tabs: Tab[] = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Início', icon: 'home' },
    { id: 'inbox', label: 'Caixa de Entrada', shortLabel: 'Inbox', icon: 'inbox' },
    { id: 'delegates', label: 'Cobranças / Delegados', shortLabel: '@Aguardando', icon: 'user-check' },
    { id: 'someday', label: 'Algum Dia / Talvez', shortLabel: 'Incubadora', icon: 'sprout' },
    { id: 'timeline', label: 'Agenda Diária', shortLabel: 'Agenda', icon: 'clock' },
    { id: 'daily', label: 'Log Diário', shortLabel: 'Hoje', icon: 'calendar' },
    { id: 'weekly', label: 'Log Semanal', shortLabel: 'Semana', icon: 'calendar-days' },
    { id: 'monthly', label: 'Log Mensal', shortLabel: 'Mês', icon: 'calendar-range' },
    { id: 'future_log', label: 'Log do Futuro', shortLabel: 'Futuro', icon: 'book-open' },
    { id: 'budget', label: 'Financeiro', shortLabel: 'Finanças', icon: 'wallet' },
    { id: 'collections', label: 'Coleções', shortLabel: 'Coleções', icon: 'library' },
    { id: 'dream_board', label: 'Sonhos', shortLabel: 'Sonhos', icon: 'sparkles' },
  ];

  bottomTabs: Tab[] = [
    { id: 'dashboard', label: 'Início', shortLabel: 'Início', icon: 'home' },
    { id: 'inbox', label: 'Inbox', shortLabel: 'Inbox', icon: 'inbox' },
    { id: 'delegates', label: 'Delegados', shortLabel: '@Aguardando', icon: 'user-check' },
    { id: 'timeline', label: 'Agenda', shortLabel: 'Agenda', icon: 'clock' },
    { id: 'daily', label: 'Hoje', shortLabel: 'Hoje', icon: 'calendar' },
  ];

  constructor() {
    setInterval(() => this.currentTime.set(new Date()), 1000);
  }

  private isPreloaderDismissed = false;
  private preloaderStartTime = Date.now();

  ngOnInit() {
    if (this.isDark()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setTimeout(() => this.dismissPreloader(), 4000);

    this.fetchLocalWeather();
    this.notificationService.clickedNotification$.subscribe(notif => {
      this.handleNotificationClick(notif);
    });
  }

  openQuickCapture() {
    if (this.quickCaptureModal) {
      this.quickCaptureModal.openModal();
    }
  }

  getInboxCount(): number {
    return this.bujoService.getItems().filter(i => 
      (i.date === 'inbox' || (i as any).isInbox === true) && 
      i.status !== 'completed' && 
      i.status !== 'cancelled'
    ).length;
  }

  getDelegatesCount(): number {
    return this.bujoService.getItems().filter(i => 
      (i.delegatedTo || /@aguardando|@esperando|@cobrar/i.test(i.content)) &&
      i.status !== 'completed' && 
      i.status !== 'cancelled'
    ).length;
  }

  private dismissPreloader() {
    if (this.isPreloaderDismissed) return;
    this.isPreloaderDismissed = true;

    const MIN_DISPLAY_MS = 2000;
    const elapsed = Date.now() - this.preloaderStartTime;
    const remainingDelay = Math.max(0, MIN_DISPLAY_MS - elapsed);

    setTimeout(() => {
      if (typeof document !== 'undefined') {
        const preloader = document.getElementById('app-preloader');
        if (preloader) {
          preloader.classList.add('fade-out');
          setTimeout(() => preloader.remove(), 500);
        }
      }
    }, remainingDelay);
  }

  fetchLocalWeather() {
    this.dismissPreloader();
  }

  handleNotificationClick(notif: any) {
    if (notif && notif.data && notif.data.targetTab) {
      this.setTab(notif.data.targetTab);
    }
    if (notif && notif.data && notif.data.itemId) {
      this.bujoService.setHighlightItemId(notif.data.itemId);
    }
  }

  setTab(id: TabId) {
    this.activeTab.set(id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('bujo_active_tab', id);
    }
    this.sidebarOpen.set(false);
  }

  toggleTheme() {
    this.isDark.set(!this.isDark());
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('bujo_theme', this.isDark() ? 'dark' : 'light');
    }
    if (this.isDark()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  getFormattedTime(): string {
    const now = this.currentTime();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  getFormattedDate(): string {
    const now = this.currentTime();
    return now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  getShortDate(): string {
    const now = this.currentTime();
    return now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  toggleDesktopNotifications(event: Event) {
    event.stopPropagation();
    this.desktopNotificationsOpen.set(!this.desktopNotificationsOpen());
  }

  toggleMobileNotifications(event: Event) {
    event.stopPropagation();
    this.mobileNotificationsOpen.set(!this.mobileNotificationsOpen());
  }

  markAllNotificationsRead() {
    this.notificationService.markAllAsRead();
  }

  get UserInitial(): string {
    const user = this.authService.currentUser;
    if (user && user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  getUserDisplayName(): string {
    const user = this.authService.currentUser;
    if (!user) return 'Usuário';

    if (user.user_metadata && (user.user_metadata['full_name'] || user.user_metadata['name'])) {
      return user.user_metadata['full_name'] || user.user_metadata['name'];
    }

    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }

    return 'Usuário';
  }

  getUserFirstName(): string {
    const fullName = this.getUserDisplayName();
    return fullName.split(' ')[0];
  }

  getUserInitial(): string {
    const name = this.getUserDisplayName();
    return name ? name.charAt(0).toUpperCase() : 'B';
  }

  getActiveLabel(): string {
    const tab = this.tabs.find(t => t.id === this.activeTab());
    return tab ? tab.label : 'BuJo Focus';
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.userMenuOpen.set(!this.userMenuOpen());
  }

  logout() {
    this.authService.logout();
    this.userMenuOpen.set(false);
  }
}
