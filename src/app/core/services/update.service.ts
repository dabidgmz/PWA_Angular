import { Injectable, OnDestroy } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval, Subscription } from 'rxjs';
import { isDevMode } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UpdateService implements OnDestroy {
  private checkInterval = interval(6 * 60 * 60 * 1000); // Verificar cada 6 horas
  private subscriptions = new Subscription();

  constructor(private swUpdate: SwUpdate) {
    if (!isDevMode() && this.swUpdate.isEnabled) {
      this.initializeUpdateCheck();
    }
  }

  private initializeUpdateCheck(): void {
    // Verificar actualizaciones disponibles
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe(() => {
        this.showUpdateNotification();
      });

    // Verificar actualizaciones periódicamente
    this.subscriptions.add(
      this.checkInterval.subscribe(() => {
        this.checkForUpdates();
      })
    );

    // Verificar actualizaciones al iniciar la app
    this.checkForUpdates();
  }

  checkForUpdates(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate()
        .then(() => {
          console.log('Verificación de actualizaciones completada');
        })
        .catch((err) => {
          console.error('Error al verificar actualizaciones:', err);
        });
    }
  }

  private showUpdateNotification(): void {
    Swal.fire({
      title: '¡Nueva versión disponible!',
      html: `
        <div class="text-center">
          <div class="mb-4">
            <svg class="mx-auto h-16 w-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
          </div>
          <p class="text-gray-700 mb-4">
            Hay una nueva versión de la aplicación disponible con mejoras y correcciones.
          </p>
          <p class="text-sm text-gray-500">
            ¿Deseas actualizar ahora?
          </p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Actualizar ahora',
      cancelButtonText: 'Más tarde',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-6 py-3 rounded-lg font-semibold',
        cancelButton: 'px-6 py-3 rounded-lg font-semibold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.activateUpdate();
      }
    });
  }

  private async activateUpdate(): Promise<void> {
    try {
      await this.swUpdate.activateUpdate();
      
      Swal.fire({
        title: 'Actualizando...',
        html: `
          <div class="text-center">
            <div class="mb-4">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <p class="text-gray-700">Aplicando actualización...</p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Recargar la aplicación después de un breve delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error al activar actualización:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo aplicar la actualización. Por favor, recarga la página manualmente.',
        icon: 'error',
        confirmButtonText: 'Recargar',
        confirmButtonColor: '#3b82f6'
      }).then(() => {
        window.location.reload();
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

