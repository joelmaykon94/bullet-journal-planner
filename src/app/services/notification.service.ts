import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { BujoService, BujoItem } from './bujo.service';
import { getLocalDateString } from '../utils/smartParser';

export interface AppNotification {
  id: string;
  taskId?: string;
  title: string;
  message: string;
  taskDate?: string;
  taskTime?: string;
  timeText?: string;
  createdAt: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private latestNotificationSubject = new BehaviorSubject<AppNotification | null>(null);
  public latestNotification$ = this.latestNotificationSubject.asObservable();
  
  private clickedNotificationSubject = new Subject<AppNotification>();
  public clickedNotification$ = this.clickedNotificationSubject.asObservable();
  
  private notifiedTaskIds = new Set<string>();

  constructor(private bujoService: BujoService) {
    this.loadPersistedNotifications();
    this.requestPermission();
    
    // Check every 30 seconds
    setInterval(() => {
      this.checkTasksForNotifications();
    }, 30000);
    
    // Initial check
    setTimeout(() => this.checkTasksForNotifications(), 2000);
  }
  
  private loadPersistedNotifications() {
    const saved = localStorage.getItem('bujo_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Converter strings de data de volta para objetos Date
        const restored = parsed.map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) }));
        this.notificationsSubject.next(restored);
        
        // Também marcar como 'já notificado' os IDs de hoje para não repetir alertas no refresh
        const today = getLocalDateString();
        restored.forEach((n: AppNotification) => {
          if (n.taskId && n.createdAt.toISOString().startsWith(today)) {
            this.notifiedTaskIds.add(n.taskId);
          }
        });
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }
  }

  private saveNotifications() {
    localStorage.setItem('bujo_notifications', JSON.stringify(this.notificationsSubject.value));
  }
  
  private requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  private checkTasksForNotifications() {
    const today = getLocalDateString();
    const items = this.bujoService.getItems().filter(i => i.date === today && i.type === 'task' && i.status !== 'completed' && i.status !== 'cancelled');
    
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    
    for (const item of items) {
      if (!item.time) continue;
      
      const [h, m] = item.time.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) continue;
      
      const taskTotalMinutes = h * 60 + m;
      const minutesLeft = taskTotalMinutes - currentTotalMinutes;
      
      // se falta 5 minutos para a tarefa E ainda não notificamos
      // Notifica se falta entre 0 e 5 minutos (caso o navegador durma e acorde)
      if (minutesLeft >= 0 && minutesLeft <= 5 && !this.notifiedTaskIds.has(item.id)) {
        this.notifiedTaskIds.add(item.id);
        this.triggerNotification(item, minutesLeft);
      }
    }
  }
  
  private triggerNotification(item: BujoItem, minutesLeft: number) {
    const title = minutesLeft === 0 ? 'Agora!' : `Daqui a ${minutesLeft} min!`;
    const timeText = minutesLeft === 0 ? 'Agora' : `Em ${minutesLeft} min`;
    const message = item.content;
    
    // 1. Notification na plataforma
    const notif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      taskId: item.id,
      title,
      message,
      taskDate: item.date,
      taskTime: item.time,
      timeText,
      createdAt: new Date(),
      read: false
    };
    
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notif, ...current]);
    this.saveNotifications();
    this.latestNotificationSubject.next(notif);
    
    // Clear the toast after 10 seconds
    setTimeout(() => {
      if (this.latestNotificationSubject.value?.id === notif.id) {
        this.latestNotificationSubject.next(null);
      }
    }, 10000);
    
    // 2. System / Browser Alert (Notification API)
    if ('Notification' in window && Notification.permission === 'granted') {
      const sysNotif = new Notification(title, {
        body: `Às ${item.time}: ${item.content}`,
        icon: '/assets/logo.svg'
      });
      sysNotif.onclick = () => {
        window.focus();
        this.handleNotificationClick(notif);
      };
    }
  }

  handleNotificationClick(notif: AppNotification) {
    this.markAsRead(notif.id);
    this.clickedNotificationSubject.next(notif);
  }

  markAsRead(id: string) {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(
      current.map(n => n.id === id ? { ...n, read: true } : n)
    );
    this.saveNotifications();
  }

  markAllAsRead() {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(
      current.map(n => ({ ...n, read: true }))
    );
    this.saveNotifications();
  }
  
  get unreadCount$(): Observable<number> {
    return new Observable(sub => {
      this.notifications$.subscribe(notifs => {
        sub.next(notifs.filter(n => !n.read).length);
      });
    });
  }

  clearLatestNotification() {
    this.latestNotificationSubject.next(null);
  }
}
