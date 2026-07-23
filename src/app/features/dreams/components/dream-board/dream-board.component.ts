import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DreamsService, DreamItem } from '../../services/dreams.service';
import { ModalService } from '../../../../services/modal.service';

@Component({
  selector: 'app-dream-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dream-board.component.html',
  styleUrls: ['./dream-board.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DreamBoardComponent implements OnInit, OnDestroy {
  dreams: DreamItem[] = [];
  
  title = '';
  description = '';
  category = 'Pessoal';
  icon = '🏆';
  showAddForm = false;
  
  selectedCategoryFilter = 'Todos';
  statusFilter: 'all' | 'active' | 'conquered' = 'all';
  
  celebratingId: string | null = null;
  
  categories = ['Pessoal', 'Carreira', 'Viagem', 'Saúde', 'Finanças', 'Bens', 'Outros'];
  emojis = ['🏆', '✨', '✈️', '💻', '🏠', '🚗', '🎓', '🏃‍♂️', '🍎', '🎨', '🎵', '💼', '💰', '❤️', '🌟', '🤝', '📚', '🏡'];
  
  private sub?: Subscription;

  constructor(private dreamsService: DreamsService, private modalService: ModalService) {}

  ngOnInit() {
    this.sub = this.dreamsService.dreams$.subscribe(data => {
      this.dreams = data;
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  get conqueredCount(): number {
    return this.dreams.filter(d => d.conquered).length;
  }

  get filteredDreams(): DreamItem[] {
    return this.dreams.filter(dream => {
      const matchesCategory = this.selectedCategoryFilter === 'Todos' || dream.category === this.selectedCategoryFilter;
      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && !dream.conquered) ||
        (this.statusFilter === 'conquered' && dream.conquered);
      return matchesCategory && matchesStatus;
    });
  }

  handleFormSubmit(e: Event) {
    e.preventDefault();
    if (!this.title.trim()) return;
    this.dreamsService.addDream(this.title, this.category, this.icon, this.description);
    this.title = '';
    this.description = '';
    this.category = 'Pessoal';
    this.icon = '🏆';
    this.showAddForm = false;
  }

  handleConquerClick(id: string, conquered: boolean) {
    if (!conquered) {
      this.celebratingId = id;
      setTimeout(() => {
        this.celebratingId = null;
      }, 2500);
    }
    this.dreamsService.toggleDreamConquered(id);
  }

  async handleDeleteDream(id: string, title: string) {
    if (await this.modalService.confirm(`Deseja realmente remover o sonho "${title}" do seu Quadro dos Sonhos?`, 'Remover Sonho', 'Remover', 'Cancelar')) {
      this.dreamsService.deleteDream(id);
    }
  }
}
