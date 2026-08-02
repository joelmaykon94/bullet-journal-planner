import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';

bootstrapApplication(App, appConfig)
  .then(() => {
    // Registrar o Service Worker em produção se suportado
    if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[Service Worker] Registrado com sucesso:', reg.scope))
        .catch(err => console.error('[Service Worker] Falha no registro:', err));
    }
  })
  .catch((err) => console.error(err));
