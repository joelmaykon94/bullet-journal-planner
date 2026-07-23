import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { ModalService } from '../../../../services/modal.service';

@Component({
  selector: 'app-auth-screen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-screen.component.html',
  styleUrls: ['./auth-screen.component.css']
})
export class AuthScreenComponent {
  email = '';
  loading = false;
  
  private authService = inject(AuthService);
  private modalService = inject(ModalService);

  async loginWithEmail() {
    if (!this.email || !this.email.includes('@')) {
      await this.modalService.alert('Por favor, informe um e-mail válido.', 'Aviso');
      return;
    }
    this.loading = true;
    await this.authService.loginSupabase(this.email);
    this.loading = false;
  }

  async loginWithGoogle() {
    this.loading = true;
    await this.authService.loginWithGoogle();
    // Redirects out of page
  }

  continueOffline() {
    this.authService.loginAnonymous();
  }
}
