import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

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

  async loginWithEmail() {
    if (!this.email || !this.email.includes('@')) {
      alert('Por favor, informe um e-mail válido.');
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
