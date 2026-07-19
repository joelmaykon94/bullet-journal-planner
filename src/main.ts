import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';

bootstrapApplication(App, appConfig)
  .then(() => {
    // Para desenvolvimento, desativar o Service Worker para que ele não cacheie o CSS antigo
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('Service Worker unregistered to prevent CSS caching issues.');
        }
      });
    }
  })
  .catch((err) => console.error(err));
