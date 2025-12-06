import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

declare global {
  interface Window {
    hcaptcha: any;
  }
}

@Component({
  selector: 'app-hcaptcha',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-2">
      <div #captchaContainer></div>

      <p *ngIf="error" class="text-sm text-red-600">
        {{ error }}
      </p>
    </div>
  `,
})
export class HcaptchaComponent implements AfterViewInit, OnDestroy {
  // Clave pública del sitio
  @Input() siteKey!: string;

  // Opciones opcionales
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() size: 'normal' | 'compact' = 'normal';

  // Emite el token cuando el captcha se resuelve / expira
  @Output() tokenChange = new EventEmitter<string | null>();
  @Output() errorChange = new EventEmitter<string | null>();

  @ViewChild('captchaContainer', { static: true })
  captchaContainer!: ElementRef<HTMLDivElement>;

  private widgetId: string | null = null;
  error: string | null = null;

  // Para evitar cargar el script varias veces
  private static scriptLoadingPromise: Promise<void> | null = null;

  async ngAfterViewInit() {
    if (!this.siteKey) {
      this.setError('Falta siteKey de hCaptcha');
      return;
    }

    try {
      await this.ensureScriptLoaded();
      this.renderWidget();
    } catch (err) {
      this.setError('No se pudo cargar hCaptcha. Intenta más tarde.');
    }
  }

  ngOnDestroy() {
    // Limpia el widget si existe
    if (this.widgetId !== null && window.hcaptcha?.remove) {
      try {
        window.hcaptcha.remove(this.widgetId);
      } catch {
        // ignorar
      }
    }
  }

  /** Permite que el padre resetee el captcha si quiere */
  reset() {
    if (this.widgetId !== null && window.hcaptcha?.reset) {
      window.hcaptcha.reset(this.widgetId);
      this.tokenChange.emit(null);
    }
  }

  /** Carga el script de hCaptcha una sola vez en toda la app */
  private ensureScriptLoaded(): Promise<void> {
    // Si ya está cargado, listo
    if (window.hcaptcha) {
      return Promise.resolve();
    }

    // Si ya se está cargando en otro componente, reusamos la promesa
    if (!HcaptchaComponent.scriptLoadingPromise) {
      HcaptchaComponent.scriptLoadingPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Error cargando el script de hCaptcha'));

        document.head.appendChild(script);
      });
    }

    return HcaptchaComponent.scriptLoadingPromise;
  }

  /** Renderiza el widget en el div */
  private renderWidget() {
    try {
      this.widgetId = window.hcaptcha.render(
        this.captchaContainer.nativeElement,
        {
          sitekey: this.siteKey,
          theme: this.theme,
          size: this.size,
          callback: (token: string) => {
            this.error = null;
            this.errorChange.emit(null);
            this.tokenChange.emit(token);
          },
          'error-callback': () => {
            this.setError('Error al resolver hCaptcha. Intenta de nuevo.');
            this.tokenChange.emit(null);
          },
          'expired-callback': () => {
            this.setError('El captcha expiró, por favor vuelve a marcarlo.');
            this.tokenChange.emit(null);
          },
        }
      );
    } catch (err) {
      this.setError('No se pudo inicializar hCaptcha.');
    }
  }

  private setError(msg: string) {
    this.error = msg;
    this.errorChange.emit(msg);
  }
}