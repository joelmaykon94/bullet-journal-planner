import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent {
  
  constructor(private authService: AuthService) {}

  clearData() {
    if (confirm('Tem certeza que deseja apagar todos os dados do sistema? Essa ação não pode ser desfeita.')) {
      localStorage.clear();
      window.location.reload();
    }
  }
}
