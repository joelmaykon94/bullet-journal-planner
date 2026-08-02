import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { getLocalDateString } from '../../../../utils/smartParser';
import { SyncStatusService } from '../../../../services/sync-status.service';

@Component({
  selector: 'app-inbox-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inbox-view.component.html',
  styleUrls: []
})
export class InboxViewComponent implements OnInit, OnDestroy {
  inboxItems: BujoItem[] = [];
  collections: any[] = [];

  // Triage state
  activeTriageItemId: string | null = null;
  triageMode: 'none' | 'schedule' | 'delegate' | 'collection' = 'none';

  scheduleDate = getLocalDateString(new Date());
  delegateName = '';
  selectedCollectionId = '';

  private itemsSub?: Subscription;
  private collectionsSub?: Subscription;

  constructor(
    private bujoService: BujoService,
    private syncStatusService: SyncStatusService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.itemsSub = this.bujoService.items$.subscribe(items => {
      this.inboxItems = items.filter(i => 
        (i.date === 'inbox' || (i as any).isInbox === true) && 
        i.status !== 'completed' && 
        i.status !== 'cancelled'
      );
      this.cdr.markForCheck();
    });

    this.collectionsSub = this.bujoService.collections$.subscribe(cols => {
      this.collections = cols;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.itemsSub) this.itemsSub.unsubscribe();
    if (this.collectionsSub) this.collectionsSub.unsubscribe();
  }

  moveToToday(item: BujoItem) {
    const todayStr = getLocalDateString(new Date());
    this.bujoService.updateItem(item.id, {
      date: todayStr,
      isInbox: false
    } as any);

    this.syncStatusService.showToast({
      type: 'success',
      message: '⚡ Item movido para o Log Diário de Hoje!'
    });
    this.resetTriage();
  }

  openSchedule(item: BujoItem) {
    this.activeTriageItemId = item.id;
    this.triageMode = 'schedule';
    this.scheduleDate = getLocalDateString(new Date());
  }

  confirmSchedule(item: BujoItem) {
    if (!this.scheduleDate) return;
    this.bujoService.updateItem(item.id, {
      date: this.scheduleDate,
      isInbox: false
    } as any);

    this.syncStatusService.showToast({
      type: 'success',
      message: `📅 Item agendado para ${this.scheduleDate}!`
    });
    this.resetTriage();
  }

  openDelegate(item: BujoItem) {
    this.activeTriageItemId = item.id;
    this.triageMode = 'delegate';
    this.delegateName = '';
  }

  confirmDelegate(item: BujoItem) {
    const person = this.delegateName.trim();
    if (!person) return;

    this.bujoService.updateItem(item.id, {
      delegatedTo: person,
      content: `${item.content} @aguardando (${person})`,
      date: getLocalDateString(new Date()),
      isInbox: false
    } as any);

    this.syncStatusService.showToast({
      type: 'success',
      message: `⏳ Delegado para @${person} e enviado para @aguardando!`
    });
    this.resetTriage();
  }

  moveToSomeday(item: BujoItem) {
    this.bujoService.updateItem(item.id, {
      date: 'someday',
      isInbox: false
    } as any);

    this.syncStatusService.showToast({
      type: 'success',
      message: '💡 Movido para Algum Dia / Talvez!'
    });
    this.resetTriage();
  }

  openCollection(item: BujoItem) {
    this.activeTriageItemId = item.id;
    this.triageMode = 'collection';
    this.selectedCollectionId = this.collections.length > 0 ? this.collections[0].id : '';
  }

  confirmCollection(item: BujoItem) {
    if (!this.selectedCollectionId) return;
    const targetCol = this.collections.find(c => c.id === this.selectedCollectionId);
    if (!targetCol) return;

    // Add task item to collection subtasks/items
    const existingItems = targetCol.items || [];
    const updatedCol = {
      ...targetCol,
      items: [...existingItems, {
        id: item.id,
        content: item.content,
        completed: false,
        createdAt: new Date().toISOString()
      }]
    };

    this.bujoService.updateCollection(updatedCol);
    // Remove from Inbox
    this.bujoService.deleteItem(item.id);

    this.syncStatusService.showToast({
      type: 'success',
      message: `📂 Movido para a Coleção "${targetCol.title}"!`
    });
    this.resetTriage();
  }

  completeItem(item: BujoItem) {
    this.bujoService.updateItem(item.id, {
      status: 'completed',
      isInbox: false
    } as any);

    this.syncStatusService.showToast({
      type: 'success',
      message: '✓ Item concluído com sucesso!'
    });
  }

  deleteItem(item: BujoItem) {
    this.bujoService.deleteItem(item.id);
    this.syncStatusService.showToast({
      type: 'offline',
      message: '🗑️ Item excluído da Caixa de Entrada.'
    });
  }

  resetTriage() {
    this.activeTriageItemId = null;
    this.triageMode = 'none';
    this.delegateName = '';
    this.selectedCollectionId = '';
    this.cdr.markForCheck();
  }
}
