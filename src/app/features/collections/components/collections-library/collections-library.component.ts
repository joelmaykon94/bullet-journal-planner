import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionsService, Collection, CollectionItem } from '../../services/collections.service';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

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
  
  showCreateCollectionModal = false;
  newColName = '';
  newColDesc = '';
  newColIcon = '📚';
  showColIconDropdown = false;
  
  emojis = ['📚', '🎨', '💼', '💻', '📝', '📅', '🎯', '🚀', '💡', '🏃‍♂️', '🍎', '✈️', '🛒', '🎵', '🍿', '🏠', '🔑', '💬', '⚠️', '🛠️', '💰', '🏆', '🧘‍♂️', '🩺', '🍕', '🌸', '🌻', '🐶', '🐱', '🌍'];

  constructor(private collectionsService: CollectionsService) {}

  ngOnInit() {
    this.collectionsService.collections$.subscribe(cols => {
      this.collections = cols;
    });
  }

  handleCancelCreateCollection() {
    this.newColName = '';
    this.newColDesc = '';
    this.newColIcon = '📚';
    this.showCreateCollectionModal = false;
    this.showColIconDropdown = false;
  }

  handleCreateCollection(event: Event) {
    event.preventDefault();
    if (!this.newColName.trim()) return;
    this.collectionsService.createCollection(this.newColName, this.newColDesc, this.newColIcon);
    this.handleCancelCreateCollection();
  }

  handleDeleteCollection(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta coleção?')) {
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

  handleDeleteCollectionItemMasonry(colId: string, itemId: string) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
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
}
