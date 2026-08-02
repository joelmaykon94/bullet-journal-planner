import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { getLocalDateString } from '../../../../utils/smartParser';
import { SyncStatusService } from '../../../../services/sync-status.service';

export interface DelegatedGroup {
  personName: string;
  items: BujoItem[];
}

@Component({
  selector: 'app-delegates-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delegates-panel.component.html',
  styleUrls: []
})
export class DelegatesPanelComponent implements OnInit, OnDestroy {
  waitingItems: BujoItem[] = [];
  groupedDelegates: DelegatedGroup[] = [];

  // View Filter
  viewMode: 'grouped' | 'list' = 'grouped';

  // New Item Quick Input
  showAddModal = false;
  newContent = '';
  newPersonName = '';

  private itemsSub?: Subscription;

  constructor(
    private bujoService: BujoService,
    private syncStatusService: SyncStatusService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.itemsSub = this.bujoService.items$.subscribe(items => {
      this.waitingItems = items.filter(i => 
        (i.delegatedTo || /@aguardando|@esperando|@cobrar/i.test(i.content)) &&
        i.status !== 'completed' && 
        i.status !== 'cancelled'
      );

      this.updateGroupedDelegates();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.itemsSub) {
      this.itemsSub.unsubscribe();
    }
  }

  updateGroupedDelegates() {
    const map = new Map<string, BujoItem[]>();

    for (const item of this.waitingItems) {
      let key = (item.delegatedTo || '').trim();
      if (!key) {
        // Try to extract name after @aguardando (Name) or @Name
        const match = item.content.match(/@aguardando\s*(?:\(([^)]+)\)|(\S+))|@(\S+)/i);
        if (match) {
          key = (match[1] || match[2] || match[3] || 'Geral').trim();
        } else {
          key = 'Geral';
        }
      }

      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }

    this.groupedDelegates = Array.from(map.entries()).map(([personName, items]) => ({
      personName,
      items
    }));
  }

  addWaitingItem() {
    const rawContent = this.newContent.trim();
    const person = this.newPersonName.trim();
    if (!rawContent) return;

    const todayStr = getLocalDateString(new Date());
    const fullContent = person 
      ? `${rawContent} @aguardando (${person})` 
      : `${rawContent} @aguardando`;

    const newItem: Partial<BujoItem> = {
      content: fullContent,
      type: 'task',
      status: 'todo',
      date: todayStr,
      delegatedTo: person || undefined,
      isInbox: false
    } as any;

    this.bujoService.addItem(newItem);
    this.syncStatusService.showToast({
      type: 'success',
      message: `⏳ Item de cobrança registrado em @aguardando!`
    });

    this.newContent = '';
    this.newPersonName = '';
    this.showAddModal = false;
  }

  followUpToday(item: BujoItem) {
    const todayStr = getLocalDateString(new Date());
    const personTag = item.delegatedTo ? `@${item.delegatedTo}` : '';
    const followUpContent = `Cobrar resposta de ${personTag}: ${item.content}`;

    const newItem: Partial<BujoItem> = {
      content: followUpContent,
      type: 'task',
      status: 'todo',
      date: todayStr,
      priority: true,
      isInbox: false
    } as any;

    this.bujoService.addItem(newItem);
    this.syncStatusService.showToast({
      type: 'success',
      message: '🔔 Lembrete de cobrança criado no Log Diário de Hoje!'
    });
  }

  markAsReceived(item: BujoItem) {
    this.bujoService.updateItem(item.id, {
      status: 'completed'
    });
    this.syncStatusService.showToast({
      type: 'success',
      message: '✓ Resposta recebida! Item concluído.'
    });
  }

  deleteItem(item: BujoItem) {
    this.bujoService.deleteItem(item.id);
    this.syncStatusService.showToast({
      type: 'offline',
      message: '🗑️ Item removido do painel @aguardando.'
    });
  }
}
