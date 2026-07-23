import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService, ModalConfig, ModalResult } from '../../../services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="config" class="fixed inset-0 z-[9999] flex items-center justify-center" style="position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 99999; display: flex; align-items: center; justify-content: center;">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background-color: rgba(28, 25, 23, 0.4); backdrop-filter: blur(4px);"
           (click)="cancel()"></div>
      
      <!-- Modal Content -->
      <div class="bg-white rounded-xl shadow-2xl w-[90%] max-w-sm relative z-10 overflow-hidden border border-stone-200 transform transition-all" style="position: relative; z-index: 10; background-color: white; width: 90%; max-width: 24rem; border-radius: 0.75rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #e7e5e4; overflow: hidden;">
        
        <!-- Header -->
        <div class="px-5 py-4 border-b border-stone-100 flex items-center gap-3"
             [ngClass]="{'bg-red-50 text-red-700 border-red-100': config.title?.includes('Excluir') || config.title?.includes('Aviso')}">
          <svg *ngIf="config.type === 'alert' || config.title?.includes('Aviso')" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <svg *ngIf="config.type === 'confirm' && !config.title?.includes('Aviso')" class="w-5 h-5 text-bujo-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <svg *ngIf="config.type === 'prompt'" class="w-5 h-5 text-bujo-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          
          <h3 class="font-bold text-[15px] font-sans m-0 leading-none">
            {{ config.title }}
          </h3>
        </div>

        <!-- Body -->
        <div class="px-5 py-5 text-sm text-stone-600 font-sans">
          <p class="leading-relaxed">{{ config.message }}</p>
          
          <div *ngIf="config.type === 'prompt'" class="mt-4">
            <input 
              #promptInput
              type="text" 
              [(ngModel)]="promptValue"
              [placeholder]="config.promptPlaceholder || ''"
              class="w-full border border-stone-300 rounded-md px-3 py-2 text-stone-800 outline-none focus:border-stone-500 shadow-sm"
              (keydown.enter)="confirm()"
              (keydown.escape)="cancel()"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-2">
          <button *ngIf="config.type !== 'alert'" 
                  (click)="cancel()" 
                  class="px-4 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none">
            {{ config.cancelText || 'Cancelar' }}
          </button>
          
          <button (click)="confirm()" 
                  class="px-4 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none"
                  [ngClass]="{
                    'bg-red-50 text-red-600 hover:bg-red-100': config.title?.includes('Excluir') || config.title?.includes('Apagar') || config.title?.includes('Sair'),
                    'bg-stone-100 text-stone-700 hover:bg-stone-200': !config.title?.includes('Excluir') && !config.title?.includes('Apagar') && !config.title?.includes('Sair')
                  }">
            <ng-container *ngIf="config.type === 'alert'">OK</ng-container>
            <ng-container *ngIf="config.type !== 'alert'">{{ config.confirmText || 'Confirmar' }}</ng-container>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent implements OnInit, OnDestroy {
  config: (ModalConfig & { resolve: (res: ModalResult) => void }) | null = null;
  promptValue: string = '';
  private sub?: Subscription;

  @ViewChild('promptInput') promptInput?: ElementRef<HTMLInputElement>;

  constructor(private modalService: ModalService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.sub = this.modalService.modalState$.subscribe(config => {
      console.log("Modal config updated:", config); this.config = config;
      this.cdr.detectChanges();
      if (config && config.type === 'prompt') {
        this.promptValue = config.promptDefault || '';
        setTimeout(() => {
          this.promptInput?.nativeElement.focus();
        }, 100);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  confirm() {
    if (!this.config) return;
    this.config.resolve({ confirmed: true, value: this.promptValue });
    this.close();
  }

  cancel() {
    if (!this.config) return;
    this.config.resolve({ confirmed: false });
    this.close();
  }

  private close() {
    this.config = null;
    this.promptValue = '';
  }
}
