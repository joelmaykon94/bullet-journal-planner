import { Component, signal, OnInit, HostListener, ViewEncapsulation, inject } from '@angular/core';
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
import { SettingsComponent } from './features/settings/components/settings/settings.component';
import { AuthScreenComponent } from './features/auth/components/auth-screen/auth-screen.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { NotificationService, AppNotification } from './services/notification.service';
import { BujoService } from './services/bujo.service';
import { AuthService } from './services/auth.service';
import { ModalService } from './services/modal.service';
import { environment } from '../environments/version';

import { SyncStatusService } from './services/sync-status.service';

export type TabId = 'dashboard' | 'daily' | 'weekly' | 'monthly' | 'timeline' | 'budget' | 'collections' | 'dream_board' | 'future_log' | 'focus' | 'settings' | 'trash';

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
  imports: [CommonModule, DashboardComponent, DailyLogComponent, TrashComponent, TimelineComponent, WeeklyLogComponent, MonthlyLogComponent, CollectionsLibraryComponent, BudgetPlannerComponent, FutureLogComponent, DreamBoardComponent, SettingsComponent, AuthScreenComponent, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None
})
export class App implements OnInit {
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
  
  // Weather Signal
  localWeather = signal<LocalWeather | null>(null);

  tabs: Tab[] = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Início', icon: 'home' },
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
    { id: 'timeline', label: 'Agenda', shortLabel: 'Agenda', icon: 'clock' },
    { id: 'daily', label: 'Hoje', shortLabel: 'Hoje', icon: 'calendar' },
    { id: 'budget', label: 'Finanças', shortLabel: 'Finanças', icon: 'wallet' },
    { id: 'collections', label: 'Coleções', shortLabel: 'Coleções', icon: 'library' },
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

    // Safety fallback: dismiss preloader after max 4.0s if weather or geolocation takes long
    setTimeout(() => this.dismissPreloader(), 4000);

    this.fetchLocalWeather();
    this.notificationService.clickedNotification$.subscribe(notif => {
      this.handleNotificationClick(notif);
    });
  }

  private dismissPreloader() {
    if (this.isPreloaderDismissed) return;
    this.isPreloaderDismissed = true;

    const MIN_DISPLAY_MS = 2000; // Garantir no mínimo 2 segundos para leitura da frase
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

  private fetchLocalWeather() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Tenta obter o nome da cidade por geocoding reverso
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`);
            const geoData = await geoRes.json();
            let cityName = geoData.city || geoData.locality || 'Local Atual';
            
            let stateAbbr = '';
            if (geoData.principalSubdivisionCode) {
              // ex: "BR-RN" -> "RN"
              stateAbbr = geoData.principalSubdivisionCode.split('-').pop() || '';
            } else if (geoData.principalSubdivision) {
              stateAbbr = geoData.principalSubdivision.substring(0, 2).toUpperCase();
            }

            const countryCode = geoData.countryCode || '';
            
            // Join valid parts
            const locationParts = [cityName, stateAbbr, countryCode].filter(Boolean);
            cityName = locationParts.join(', ');

            // Busca os dados do clima usando o WeatherService existente
            const weatherData = await this.weatherService.getCityWeatherData({
              name: cityName,
              latitude,
              longitude
            });
            
            const code = weatherData.current.weatherCode;
            this.localWeather.set({
              city: cityName,
              temp: Math.round(weatherData.current.temperature),
              label: this.getWeatherLabel(code),
              icon: this.getWeatherIconTemplate(code)
            });
          } catch (e) {
            console.error('Failed to load local weather:', e);
          } finally {
            this.dismissPreloader();
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.dismissPreloader();
        },
        { timeout: 3000 }
      );
    } else {
      this.dismissPreloader();
    }
  }

  private getWeatherLabel(code: number) {
    if (code === 0) return 'Céu Limpo';
    if ([1, 2, 3].includes(code)) return 'Nublado';
    if ([45, 48].includes(code)) return 'Nevoeiro';
    if ([51, 53, 55, 56, 57].includes(code)) return 'Garoa';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Chuva';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Neve';
    if ([95, 96, 99].includes(code)) return 'Tempestade';
    return 'Instável';
  }

  private getWeatherIconTemplate(code: number): string {
    if (code === 0) return 'sun';
    if ([1, 2, 3].includes(code)) return 'cloud';
    if ([45, 48].includes(code)) return 'cloud-fog';
    if ([51, 53, 55, 56, 57].includes(code)) return 'cloud-drizzle';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'cloud-rain';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'cloud-snow';
    if ([95, 96, 99].includes(code)) return 'cloud-lightning';
    return 'thermometer';
  }

  setTab(tabId: TabId) {
    this.activeTab.set(tabId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('bujo_active_tab', tabId);
    }
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }

  async logout() {
    if (await this.modalService.confirm('Tem certeza que deseja sair?', 'Sair da conta')) {
      await this.authService.logout();
      window.location.reload();
    }
  }


  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  toggleDesktopNotifications(event?: Event) {
    if (event) event.stopPropagation();
    this.desktopNotificationsOpen.update(v => !v);
    this.mobileNotificationsOpen.set(false);
    this.userMenuOpen.set(false);
  }

  toggleMobileNotifications(event?: Event) {
    if (event) event.stopPropagation();
    this.mobileNotificationsOpen.update(v => !v);
    this.desktopNotificationsOpen.set(false);
    this.userMenuOpen.set(false);
  }

  toggleUserMenu(event?: Event) {
    if (event) event.stopPropagation();
    this.userMenuOpen.update(v => !v);
    this.desktopNotificationsOpen.set(false);
    this.mobileNotificationsOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container') && !target.closest('.user-menu-container')) {
      this.desktopNotificationsOpen.set(false);
      this.mobileNotificationsOpen.set(false);
      this.userMenuOpen.set(false);
    }
  }

  markNotificationRead(id: string) {
    this.notificationService.markAsRead(id);
  }

  handleNotificationClick(notif: any) {
    this.notificationService.markAsRead(notif.id);
    if (notif.taskDate) {
      this.bujoService.setSelectedDate(notif.taskDate);
      this.setTab('daily');
    }
    this.desktopNotificationsOpen.set(false);
    this.mobileNotificationsOpen.set(false);
  }

  markAllNotificationsRead() {
    this.notificationService.markAllAsRead();
  }

  toggleTheme() {
    this.isDark.update(v => !v);
    const isDarkNow = this.isDark();
    if (isDarkNow) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bujo_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bujo_theme', 'light');
    }
  }

  getActiveLabel(): string {
    return this.tabs.find(t => t.id === this.activeTab())?.label ?? '';
  }

  getFormattedTime(): string {
    const d = this.currentTime();
    return d.toLocaleTimeString('pt-BR', { 
      timeZone: 'America/Sao_Paulo', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  getFormattedDate(): string {
    const d = this.currentTime();
    
    // Configura o formatter com o timezone de São Paulo para evitar dessincronia
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    let formatted = formatter.format(d);
    formatted = formatted.replace(',', ''); 
    formatted = formatted.replace(' de ' + d.getFullYear(), ' ' + d.getFullYear()); 
    
    return formatted;
  }

  getShortDate(): string {
    const d = this.currentTime();
    return d.toLocaleDateString('pt-BR', { 
      timeZone: 'America/Sao_Paulo', 
      day: '2-digit', 
      month: 'short' 
    }).replace('.','');
  }

  getUserDisplayName(): string {
    const user = this.authService.currentUser;
    if (!user || user.id === 'anonymous-user-id') return 'Visitante';
    
    // 1. Tenta pegar o nome completo retornado pelo Supabase (ex: Google OAuth metadata)
    const metaName = user.user_metadata?.['full_name'] || user.user_metadata?.['name'];
    if (metaName && typeof metaName === 'string' && metaName.trim()) {
      return metaName.trim();
    }

    // 2. Se não houver nome nos metadados, limpa e formata o e-mail (ex: "joel.maykon" -> "Joel Maykon")
    const email = user.email || '';
    if (!email) return 'Usuário';

    const prefix = email.split('@')[0];
    return prefix
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  getUserFirstName(): string {
    const displayName = this.getUserDisplayName();
    return displayName.split(' ')[0];
  }

  getUserInitial(): string {
    return this.getUserFirstName().charAt(0).toUpperCase();
  }
}
