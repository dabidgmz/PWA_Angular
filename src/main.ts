import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { isDevMode } from '@angular/core';

// Solo registrar Service Worker en producción
if('serviceWorker' in navigator && !isDevMode()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/ngsw-worker.js').then(() => {
      console.log('Service Worker registrado con éxito');
    }).catch((err) => {
      console.error('Service Worker no registrado:', err);
    });
  });
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
