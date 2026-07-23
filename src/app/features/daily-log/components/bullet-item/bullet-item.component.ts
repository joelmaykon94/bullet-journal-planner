import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BujoItem, BujoService } from '../../../../services/bujo.service';
import { parseSmartTask } from '../../../../utils/smartParser';

export interface ContentChunk {
  type: 'text' | 'tag' | 'link' | 'bold';
  value: string;
  display?: string;
  tagClass?: string;
}

// export const tagColors and tagIcons are no longer needed here as they've moved to BujoService

@Component({
  selector: 'app-bullet-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-start gap-2 py-1.5 group hover:bg-stone-50 transition-colors px-2 -mx-2 rounded cursor-pointer relative">
      <button class="w-6 h-6 flex-shrink-0 flex items-center justify-center font-bold text-lg font-mono text-stone-500 hover:text-stone-900 transition-colors bujo-tooltip"
              [attr.data-tooltip]="getStatusTooltip()"
              (click)="toggleStatus($event)">
        {{ getSymbol() }}
      </button>
      
      <!-- Content (View Mode) -->
      <div *ngIf="!isEditing" class="flex-1 flex flex-col pt-[3px] pr-14" (dblclick)="onEdit($event)">
        <div class="text-[15px] font-sans leading-snug flex flex-wrap gap-1 items-center" 
             [class.line-through]="item.status === 'completed' || item.status === 'cancelled'"
             [class.text-stone-400]="item.status === 'completed' || item.status === 'cancelled'"
             [class.opacity-50]="item.status === 'completed'">
             
             <!-- Time Badge -->
             <span *ngIf="item.time" class="bg-stone-800 text-stone-100 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono inline-flex items-center gap-1 shadow-sm border border-stone-900 mx-1">
               {{ item.time }}
               <ng-container *ngIf="item.endTime">- {{ item.endTime }}</ng-container>
             </span>

             <ng-container *ngFor="let chunk of contentChunks">
               <span *ngIf="chunk.type === 'text'" class="whitespace-pre-wrap">{{ chunk.value }}</span>
               
               <strong *ngIf="chunk.type === 'bold'" class="font-bold">{{ chunk.value }}</strong>

               <span *ngIf="chunk.type === 'tag'" [class]="chunk.tagClass">
                 {{ chunk.display }}
               </span>
               
               <a *ngIf="chunk.type === 'link'" 
                  [href]="chunk.value" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium bg-blue-50 px-1 rounded mx-1"
                  (click)="$event.stopPropagation()">
                 <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                 Link
               </a>
             </ng-container>
             
        </div>
        
        <div *ngIf="item.description" class="text-xs text-stone-500 mt-1"
             [class.opacity-50]="item.status === 'completed'">
          {{ item.description }}
        </div>
      </div>

      <!-- Content (Edit Mode) -->
      <div *ngIf="isEditing" class="flex-1 flex pt-[2px] pr-2">
        <input 
          #editInput
          type="text" 
          [(ngModel)]="editValue" 
          (blur)="saveEdit()"
          (keydown)="handleEditKeyDown($event)"
          (keydown.enter)="saveEdit()"
          (keydown.escape)="cancelEdit()"
          (click)="$event.stopPropagation()"
          class="w-full bg-white border border-stone-300 rounded px-2 py-1 text-[15px] font-sans text-stone-800 outline-none focus:border-stone-500 shadow-inner"
          autofocus
        />
      </div>

      <!-- Actions -->
      <div *ngIf="!isEditing" class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button *ngIf="item.type === 'task'" (click)="onMigrate($event, 'prev')" class="text-stone-400 hover:text-orange-600 p-1 hover:bg-orange-50 rounded transition-colors bujo-tooltip" data-tooltip="Antecipar">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <button *ngIf="item.type === 'task'" (click)="onMigrate($event, 'next')" class="text-stone-400 hover:text-orange-600 p-1 hover:bg-orange-50 rounded transition-colors bujo-tooltip" data-tooltip="Migrar">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
        <button (click)="onDelete($event)" class="text-stone-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors bujo-tooltip" data-tooltip="Deletar">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class BulletItemComponent implements OnInit {
  @Input({ required: true }) item!: BujoItem;
  @Output() statusChange = new EventEmitter<BujoItem>();
  @Output() delete = new EventEmitter<string>();
  
  contentChunks: ContentChunk[] = [];
  
  isEditing = false;
  editValue = '';

  constructor(private bujoService: BujoService) {}

  ngOnInit() {
    this.parseContent();
  }
  
  ngOnChanges() {
    this.parseContent();
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.isEditing = true;
    this.editValue = this.item.content;
  }

  saveEdit() {
    if (!this.isEditing) return;
    this.isEditing = false;
    const val = this.editValue.trim();
    if (val && val !== this.item.content) {
      const parsed = parseSmartTask(val, this.item.date);
      
      this.statusChange.emit({ 
        ...this.item, 
        content: parsed.cleanContent || val,
        date: parsed.date || this.item.date,
        time: parsed.time || this.item.time,
        endTime: parsed.endTime || this.item.endTime,
        priority: parsed.priority !== undefined ? parsed.priority : this.item.priority
      });
    }
  }

  cancelEdit() {
    this.isEditing = false;
  }

  handleEditKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      
      const before = this.editValue.substring(0, start);
      const selected = this.editValue.substring(start, end);
      const after = this.editValue.substring(end);
      
      this.editValue = `${before}*${selected}*${after}`;
      
      setTimeout(() => {
        input.setSelectionRange(start + 1, end + 1);
      }, 0);
    }
  }

  onMigrate(event: Event, direction: 'prev' | 'next') {
    event.stopPropagation();
    if (!this.item.date) return;
    
    const newStatus = direction === 'next' ? 'migrated' : 'scheduled';
    
    const d = new Date(this.item.date + 'T00:00:00');
    d.setDate(d.getDate() + (direction === 'next' ? 1 : -1));
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const targetDate = `${yyyy}-${mm}-${dd}`;
    
    // Atualiza o item atual, mudando sua data e status (move a tarefa, sem duplicar)
    this.statusChange.emit({ 
      ...this.item, 
      date: targetDate,
      status: newStatus 
    });
  }

  parseContent() {
    const raw = this.item.content || '';
    const chunks: ContentChunk[] = [];
    
    const boldTokens = raw.split(/(\*[^*]+\*)/);
    
    for (const bToken of boldTokens) {
      if (!bToken) continue;
      
      if (bToken.startsWith('*') && bToken.endsWith('*') && bToken.length > 1) {
        chunks.push({ type: 'bold', value: bToken.substring(1, bToken.length - 1) });
        continue;
      }
      
      // Simple parser splitting by spaces to find tags and links
      const tokens = bToken.split(/(\s+)/);
      
      let currentText = '';
      
      for (const token of tokens) {
        if (!token.trim()) {
          currentText += token;
          continue;
        }

        const lower = token.toLowerCase();
        const tags = this.bujoService.getTags();
        const foundTag = tags.find(t => t.id.toLowerCase() === lower);
        
        // Is it a known tag?
        if (foundTag) {
          if (currentText) {
            chunks.push({ type: 'text', value: currentText });
            currentText = '';
          }
          chunks.push({
            type: 'tag',
            value: token,
            display: foundTag.label,
            tagClass: foundTag.colorClass
          });
          continue;
        }
        
        // Is it a link?
        if (lower.startsWith('http://') || lower.startsWith('https://')) {
          if (currentText) {
            chunks.push({ type: 'text', value: currentText });
            currentText = '';
          }
          chunks.push({
            type: 'link',
            value: token
          });
          continue;
        }
        
        // Check legacy links (www.)
        if (lower.startsWith('www.')) {
          if (currentText) {
            chunks.push({ type: 'text', value: currentText });
            currentText = '';
          }
          chunks.push({
            type: 'link',
            value: 'https://' + token
          });
          continue;
        }

        currentText += token;
      }
      
      if (currentText) {
        chunks.push({ type: 'text', value: currentText });
      }
    }
    
    this.contentChunks = chunks;
  }

  getSymbol(): string {
    if (this.item.type === 'event') return 'o';
    if (this.item.type === 'note') return '-';
    
    // Task
    switch (this.item.status) {
      case 'completed': return 'X';
      case 'cancelled': return '—';
      case 'in_progress': return '/';
      case 'migrated': return '>';
      case 'scheduled': return '<';
      case 'todo':
      default: return '•';
    }
  }

  getStatusTooltip(): string {
    if (this.item.type === 'event') return 'Evento';
    if (this.item.type === 'note') return 'Nota';
    
    switch (this.item.status) {
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'in_progress': return 'Em andamento';
      case 'migrated': return 'Migrada';
      case 'scheduled': return 'Antecipada';
      case 'todo':
      default: return 'Pendente';
    }
  }

  toggleStatus(event: Event) {
    event.stopPropagation();
    if (this.item.type !== 'task') return;

    let newStatus = this.item.status;
    if (this.item.status === 'todo') newStatus = 'completed';
    else if (this.item.status === 'completed') newStatus = 'cancelled';
    else newStatus = 'todo';

    this.statusChange.emit({ ...this.item, status: newStatus });
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.item.id);
  }
}
