import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { BujoService, BujoTag } from '../../../../services/bujo.service';
import { ModalService } from '../../../../services/modal.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit, OnDestroy {
  tags: BujoTag[] = [];
  private tagsSub?: Subscription;

  isEditingTag = false;
  currentEditingTag: Partial<BujoTag> & { oldId?: string } = {};

  private readonly availableColors = [
    'blue', 'cyan', 'amber', 'emerald', 'purple', 'indigo', 'orange', 'fuchsia', 'green', 'slate', 'red', 'rose'
  ];
  
  constructor(private authService: AuthService, private bujoService: BujoService, private modalService: ModalService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.tagsSub = this.bujoService.tags$.subscribe(t => this.tags = t);
  }

  ngOnDestroy() {
    if (this.tagsSub) this.tagsSub.unsubscribe();
  }

  openNewTagModal() {
    this.isEditingTag = true;
    this.currentEditingTag = { label: '' };
  }

  editTag(tag: BujoTag) {
    this.isEditingTag = true;
    this.currentEditingTag = { ...tag, oldId: tag.id };
  }

  cancelEditTag() {
    this.isEditingTag = false;
    this.currentEditingTag = {};
  }

  async saveTag() {
    const label = (this.currentEditingTag.label || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    if (!label) {
       await this.modalService.alert('Nome da tag é inválido.', 'Aviso');
       return;
    }
    
    const newId = '@' + label;
    let colorClass = this.currentEditingTag.colorClass;
    
    if (this.tags.some(t => t.id === newId) && this.currentEditingTag.oldId !== newId) {
       await this.modalService.alert('Já existe uma tag com este nome.', 'Aviso');
       return;
    }

    if (!colorClass) {
       const colorName = this.availableColors[Math.floor(Math.random() * this.availableColors.length)];
       colorClass = `bg-${colorName}-500/10 text-${colorName}-600 border-${colorName}-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border`;
    }

    const tagObj: BujoTag = { id: newId, label, colorClass };

    if (this.currentEditingTag.oldId) {
      const usageCount = this.bujoService.countItemsWithTag(this.currentEditingTag.oldId);
      if (usageCount > 0) {
        if (!await this.modalService.confirm(`Esta tag está sendo usada em ${usageCount} tarefa(s). Alterar seu nome afetará essas tarefas. Deseja continuar?`, 'Atenção')) {
          return;
        }
      }
      this.bujoService.updateTag(this.currentEditingTag.oldId, tagObj);
    } else {
      this.bujoService.addTag(tagObj);
    }
    
    this.isEditingTag = false;
    this.currentEditingTag = {};
    this.cdr.detectChanges();
  }

  async deleteTag(tag: BujoTag) {
    const usageCount = this.bujoService.countItemsWithTag(tag.id);
    if (usageCount > 0) {
      if (!await this.modalService.confirm(`Esta tag está sendo usada em ${usageCount} tarefa(s). Se você excluir, ela será removida dessas tarefas. Deseja continuar?`, 'Excluir tag em uso', 'Excluir', 'Cancelar')) {
        return;
      }
    } else {
      if (!await this.modalService.confirm(`Tem certeza que deseja excluir a tag ${tag.id}?`, 'Excluir tag', 'Excluir', 'Cancelar')) {
        return;
      }
    }
    this.bujoService.deleteTag(tag.id);
    this.cdr.detectChanges();
  }
}
