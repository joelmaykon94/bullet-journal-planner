import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalConfig {
  title?: string;
  message: string;
  type: 'alert' | 'confirm' | 'prompt';
  promptPlaceholder?: string;
  promptDefault?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ModalResult {
  confirmed: boolean;
  value?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalState = new BehaviorSubject<(ModalConfig & { resolve: (res: ModalResult) => void }) | null>(null);
  modalState$ = this.modalState.asObservable();

  alert(message: string, title: string = 'Aviso'): Promise<void> {
    return new Promise((resolve) => {
      this.modalState.next({
        type: 'alert',
        message,
        title,
        resolve: () => resolve()
      });
    });
  }

  confirm(message: string, title: string = 'Confirmação', confirmText = 'Confirmar', cancelText = 'Cancelar'): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalState.next({
        type: 'confirm',
        message,
        title,
        confirmText,
        cancelText,
        resolve: (res) => resolve(res.confirmed)
      });
    });
  }
  
  prompt(message: string, title: string = 'Entrada', promptDefault = '', promptPlaceholder = ''): Promise<string | null> {
    return new Promise((resolve) => {
      this.modalState.next({
        type: 'prompt',
        message,
        title,
        promptDefault,
        promptPlaceholder,
        resolve: (res) => resolve(res.confirmed ? (res.value || '') : null)
      });
    });
  }
}
