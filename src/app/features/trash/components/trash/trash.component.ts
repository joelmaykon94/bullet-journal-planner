import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col max-w-3xl mx-auto w-full pb-20">
      
      <!-- Cabeçalho -->
      <div class="border-b-2 border-stone-800 pb-4 mb-6">
        <h1 class="text-3xl sm:text-4xl font-serif text-stone-900 font-bold italic tracking-tight">Lixeira</h1>
        <p class="text-sm text-stone-500 font-mono mt-1 uppercase tracking-widest">Itens Excluídos</p>
      </div>

      <!-- Lista de Itens na Lixeira -->
      <div class="flex flex-col gap-2">
        <ng-container *ngIf="trashItems.length > 0; else noItems">
          <div *ngFor="let item of trashItems" class="flex justify-between items-center bg-stone-50 p-3 rounded border border-stone-200">
            <div class="flex flex-col">
              <span class="text-stone-800 text-[15px] line-through opacity-70">{{ item.content }}</span>
              <span class="text-[10px] text-stone-500 font-mono uppercase tracking-widest mt-1">
                {{ item.date }} • {{ item.type }}
              </span>
            </div>
            
            <button (click)="restoreItem(item.id)" 
                    class="bg-stone-800 text-stone-100 px-3 py-1 rounded text-xs font-mono uppercase tracking-widest hover:bg-stone-700 transition-colors">
              Restaurar
            </button>
          </div>
        </ng-container>
        
        <ng-template #noItems>
          <div class="text-center py-12 text-stone-400 font-serif italic text-lg border-2 border-dashed border-stone-200 rounded">
            A lixeira está vazia.
          </div>
        </ng-template>
      </div>

    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class TrashComponent implements OnInit, OnDestroy {
  trashItems: BujoItem[] = [];
  private sub?: Subscription;

  constructor(private bujoService: BujoService) {}

  ngOnInit() {
    this.sub = this.bujoService.trash$.subscribe(items => {
      this.trashItems = items;
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  restoreItem(id: string) {
    this.bujoService.restoreItem(id);
  }
}
