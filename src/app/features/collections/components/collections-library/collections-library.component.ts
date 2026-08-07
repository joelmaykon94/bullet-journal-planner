import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionsService, Collection, CollectionItem } from '../../services/collections.service';
import { ModalService } from '../../../../services/modal.service';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

import { BujoService } from '../../../../services/bujo.service';
import { SyncStatusService } from '../../../../services/sync-status.service';
import { getLocalDateString } from '../../../../utils/smartParser';

@Component({
  selector: 'app-collections-library',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './collections-library.component.html',
  styleUrls: ['./collections-library.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CollectionsLibraryComponent implements OnInit {
  collections: Collection[] = [];
  
  newColName = '';
  selectedCategory: 'projetos' | 'estudos' | 'trabalho' | 'pessoal' | 'outros' = 'projetos';
  categoryFilter: 'all' | 'projetos' | 'estudos' | 'trabalho' | 'pessoal' | 'outros' = 'all';

  categoryIcons: Record<string, string> = {
    projetos: '🚀',
    estudos: '🎓',
    trabalho: '💼',
    pessoal: '👤',
    outros: '📚'
  };

  categoryBadges: Record<string, { label: string; class: string }> = {
    projetos: { label: '🚀 Projeto', class: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' },
    estudos: { label: '🎓 Estudo', class: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' },
    trabalho: { label: '💼 Trabalho', class: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
    pessoal: { label: '👤 Pessoal', class: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
    outros: { label: '📚 Outros', class: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' }
  };

  constructor(
    private collectionsService: CollectionsService, 
    private modalService: ModalService,
    private bujoService: BujoService,
    private syncStatusService: SyncStatusService
  ) {}

  ngOnInit() {
    this.collectionsService.collections$.subscribe(cols => {
      this.collections = cols;
    });
  }

  trackByColId(index: number, col: Collection): string {
    return col.id;
  }

  trackByItemId(index: number, item: CollectionItem): string {
    return item.id;
  }

  get filteredCollections(): Collection[] {
    // Sort collections from newest to oldest
    const sorted = [...this.collections].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.id ? Number(a.id.replace('col-', '')) || 0 : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.id ? Number(b.id.replace('col-', '')) || 0 : 0);
      return timeB - timeA;
    });

    if (this.categoryFilter === 'all') return sorted;

    return sorted.filter(c => {
      const cat = (c as any).category || 'outros';
      return cat === this.categoryFilter;
    });
  }

  getColCategoryBadge(col: Collection): { label: string; class: string } {
    const cat = (col as any).category || 'outros';
    return this.categoryBadges[cat] || this.categoryBadges['outros'];
  }

  handleCreateCollection(event: Event) {
    event.preventDefault();
    if (!this.newColName.trim()) return;

    const icon = this.categoryIcons[this.selectedCategory] || '📚';
    
    // Create collection and attach category property
    const newColObj: any = {
      id: `col-${Date.now()}`,
      name: this.newColName.trim(),
      description: '',
      icon: icon,
      category: this.selectedCategory,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const currentCols = this.collectionsService.collections;
    (this.collectionsService as any).saveCollections([...currentCols, newColObj]);

    this.syncStatusService.showToast({
      type: 'success',
      message: `📚 Coleção "${this.newColName}" criada com sucesso!`
    });

    this.newColName = '';
  }

  async handleDeleteCollection(id: string, event: Event) {
    event.stopPropagation();
    if (await this.modalService.confirm('Tem certeza que deseja excluir esta coleção?', 'Excluir Coleção', 'Excluir', 'Cancelar')) {
      this.collectionsService.deleteCollection(id);
    }
  }

  // --- MASONRY KANBAN LOGIC ---
  newItemsContent: { [colId: string]: string } = {};

  handleAddMasonryItem(colId: string) {
    const title = this.newItemsContent[colId];
    if (!title || !title.trim()) return;
    this.collectionsService.createCollectionItem(colId, title, '');
    this.newItemsContent[colId] = '';
  }

  async handleDeleteCollectionItemMasonry(colId: string, itemId: string) {
    if (await this.modalService.confirm('Tem certeza que deseja excluir este item?', 'Excluir Item', 'Excluir', 'Cancelar')) {
      this.collectionsService.deleteCollectionItem(colId, itemId);
    }
  }

  handleUpdateCollectionItemStatus(colId: string, itemId: string, status: 'todo' | 'doing' | 'done') {
    this.collectionsService.updateCollectionItemStatus(colId, itemId, status);
  }

  dropItemMasonry(colId: string, event: CdkDragDrop<any[]>) {
    if (event.previousIndex !== event.currentIndex) {
      this.collectionsService.reorderItems(colId, event.previousIndex, event.currentIndex);
    }
  }

  getCompletedSubtasksCount(item: CollectionItem): number {
    return item.subtasks?.filter(s => s.completed).length || 0;
  }

  getCompletedCount(col: Collection): number {
    if (!col || !col.items) return 0;
    return col.items.filter(i => i.status === 'done').length;
  }

  getCompletedPercent(col: Collection): number {
    if (!col || !col.items || col.items.length === 0) return 0;
    const completed = this.getCompletedCount(col);
    return Math.round((completed / col.items.length) * 100);
  }

  sendAsNextAction(col: Collection, item: CollectionItem) {
    const todayStr = getLocalDateString(new Date());
    this.bujoService.addItem({
      content: `${item.title} (Projeto: ${col.name})`,
      type: 'task',
      status: 'todo',
      date: todayStr,
      collectionId: col.id,
      collectionItemId: item.id
    } as any);

    this.syncStatusService.showToast({
      type: 'success',
      message: `📌 Próxima ação "${item.title}" enviada ao Daily Log!`
    });
  }
}
