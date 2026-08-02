import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';

bootstrapApplication(App, appConfig)
  .then(() => {
    // Registrar o Service Worker em produção se suportado com auto-update
    if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('[Service Worker] Registrado com sucesso (v4):', reg.scope);
          // Forçar checagem de atualizações no servidor
          reg.update();

          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[Service Worker] Nova versão de produção detectada. Recarregando página para aplicar novos estilos...');
                  window.location.reload();
                }
              };
            }
          };
        })
        .catch(err => console.error('[Service Worker] Falha no registro:', err));
    }
  })
  .catch((err) => console.error(err));
