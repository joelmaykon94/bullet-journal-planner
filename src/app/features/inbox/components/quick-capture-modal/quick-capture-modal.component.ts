import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { parseSmartTask, getLocalDateString } from '../../../../utils/smartParser';
import { SyncStatusService } from '../../../../services/sync-status.service';

@Component({
  selector: 'app-quick-capture-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-capture-modal.component.html',
  styleUrls: []
})
export class QuickCaptureModalComponent implements OnInit, OnDestroy {
  @ViewChild('captureInput') captureInput!: ElementRef<HTMLInputElement>;

  isOpen = false;
  content = '';
  itemType: 'task' | 'event' | 'note' = 'task';
  targetDate = getLocalDateString(new Date());

  collections: any[] = [];
  selectedCollectionId = '';

  private collectionsSub?: Subscription;

  constructor(
    private bujoService: BujoService,
    private syncStatusService: SyncStatusService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.collectionsSub = this.bujoService.collections$.subscribe(cols => {
      this.collections = cols;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.collectionsSub) {
      this.collectionsSub.unsubscribe();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent) {
    // Ctrl + K or Cmd + K opens the modal
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openModal();
    }
    // ESC closes modal if open
    if (event.key === 'Escape' && this.isOpen) {
      this.closeModal();
    }
  }

  openModal() {
    this.isOpen = true;
    this.content = '';
    this.itemType = 'task';
    this.targetDate = getLocalDateString(new Date());
    this.selectedCollectionId = '';
    this.cdr.markForCheck();

    setTimeout(() => {
      if (this.captureInput && this.captureInput.nativeElement) {
        this.captureInput.nativeElement.focus();
      }
    }, 100);
  }

  closeModal() {
    this.isOpen = false;
    this.content = '';
    this.cdr.markForCheck();
  }

  saveToInbox() {
    const raw = this.content.trim();
    if (!raw) return;

    const parsed = parseSmartTask(raw, 'inbox');
    const newItem: Partial<BujoItem> = {
      content: parsed.cleanContent || raw,
      type: this.itemType,
      status: 'todo',
      date: 'inbox',
      time: parsed.time,
      endTime: parsed.endTime,
      priority: parsed.priority,
      isInbox: true
    } as any;

    this.bujoService.addItem(newItem);
    this.syncStatusService.showToast({
      type: 'success',
      message: '📥 Capturado para a Caixa de Entrada (Inbox Zero)!'
    });

    this.closeModal();
  }

  saveToToday() {
    const raw = this.content.trim();
    if (!raw) return;

    const todayStr = getLocalDateString(new Date());
    const parsed = parseSmartTask(raw, todayStr);
    const newItem: Partial<BujoItem> = {
      content: parsed.cleanContent || raw,
      type: this.itemType,
      status: 'todo',
      date: todayStr,
      time: parsed.time,
      endTime: parsed.endTime,
      priority: parsed.priority,
      isInbox: false
    } as any;

    this.bujoService.addItem(newItem);
    this.syncStatusService.showToast({
      type: 'success',
      message: '⚡ Adicionado diretamente ao Log Diário de Hoje!'
    });

    this.closeModal();
  }
}
