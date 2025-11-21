import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { OtpInputComponent } from '../shared/components/otp-input.component';
import { VerifyCodeResponse } from '../core/models/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    OtpInputComponent
  ],
  template: `
    <div class="verify-container min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Animated Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-90">
        <div class="absolute inset-0 pattern-overlay opacity-20"></div>
      </div>
      
      <div class="w-full max-w-md relative z-10">
        <!-- Logo Section -->
        <div class="text-center mb-8 animate-fade-in">
          <div class="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300 relative">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl blur-xl opacity-50"></div>
            <mat-icon class="text-white text-4xl relative z-10">verified_user</mat-icon>
          </div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-2 drop-shadow-lg">
            Verificación de Código
          </h1>
          <p class="text-white text-base font-medium opacity-90">Ingresa el código de 6 dígitos enviado a tu email</p>
        </div>

        <!-- Verification Card -->
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 animate-slide-up">
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <mat-icon class="text-green-600 text-4xl">mail</mat-icon>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
              Código de Verificación
            </h2>
            <p class="text-gray-600 mb-1">Hemos enviado un código de 6 dígitos a:</p>
            <p class="text-blue-600 font-semibold">{{ email }}</p>
          </div>
          
          <div class="space-y-6">
            <!-- OTP Input -->
            <div class="flex flex-col items-center">
              <app-otp-input 
                [hasError]="hasError"
                (completed)="onCodeComplete($event)">
              </app-otp-input>
              
              <p *ngIf="hasError" class="text-red-500 text-sm mt-4 flex items-center">
                <mat-icon class="text-sm mr-1">error</mat-icon>
                Código incorrecto. Intenta nuevamente.
              </p>
            </div>

            <!-- Resend Code -->
            <div class="text-center pt-4 border-t border-gray-200">
              <p class="text-gray-600 text-sm mb-4">¿No recibiste el código?</p>
              <button 
                mat-button 
                (click)="resendCode()"
                [disabled]="isResending || isLoading"
                class="text-blue-600 hover:text-blue-700 font-medium">
                <mat-icon class="text-sm mr-1">refresh</mat-icon>
                {{ isResending ? 'Reenviando...' : 'Reenviar código' }}
              </button>
            </div>

            <!-- Back to Login -->
            <div class="text-center">
              <button 
                mat-button 
                (click)="goBackToLogin()"
                [disabled]="isLoading"
                class="text-gray-600 hover:text-gray-800">
                <mat-icon class="text-sm mr-1">arrow_back</mat-icon>
                Volver al login
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-white/80 text-sm mt-8 font-medium">
          Sistema de Gestión Pokémon © 2024
        </p>
      </div>
    </div>
  `,
  styles: [`
    .verify-container {
      position: relative;
    }
    
    .pattern-overlay {
      background-image: 
        radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0);
      background-size: 20px 20px;
    }
    
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slide-up {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fade-in {
      animation: fade-in 0.8s ease-out;
    }
    
    .animate-slide-up {
      animation: slide-up 0.6s ease-out;
    }
  `]
})
export class VerifyCodeComponent implements OnInit {
  @ViewChild(OtpInputComponent) otpInput!: OtpInputComponent;
  
  email = '';
  hasError = false;
  isLoading = false;
  isResending = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Obtener el email de los query params
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });

    // Si no hay email en query params, intentar obtenerlo del estado de navegación
    if (!this.email) {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras?.state?.['email']) {
        this.email = navigation.extras.state['email'];
      }
    }

    // Si aún no hay email, intentar obtenerlo de los query params directamente
    if (!this.email) {
      const snapshot = this.route.snapshot;
      if (snapshot.queryParams['email']) {
        this.email = snapshot.queryParams['email'];
      }
    }

    // Si aún no hay email, redirigir al login
    if (!this.email) {
      this.toastService.warning('Email no encontrado. Por favor, inicia sesión nuevamente.');
      this.router.navigate(['/login']);
    }
  }

  onCodeComplete(code: string) {
    if (code.length === 6) {
      this.verifyCode(code);
    }
  }

  verifyCode(code: string) {
    this.isLoading = true;
    this.hasError = false;

    this.authService.verifyCode(this.email, code).subscribe({
      next: (response: VerifyCodeResponse) => {
        this.isLoading = false;
        this.toastService.success(`Bienvenido, ${response.user.name}`);
        
        Swal.fire({
          title: '¡Código verificado!',
          text: 'Has iniciado sesión correctamente',
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-lg'
          }
        }).then(() => {
          // Redirigir según el rol
          if (response.user.role === 'profesor' || response.user.role === 'professor') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.hasError = true;
        
        // Resetear el OTP input
        if (this.otpInput) {
          this.otpInput.reset();
        }
        
        const errorMessage = error.error?.message || 'Código incorrecto. Por favor, intenta nuevamente.';
        this.toastService.error(errorMessage);
      }
    });
  }

  resendCode() {
    if (!this.email) {
      this.toastService.error('Email no encontrado. Por favor, inicia sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    this.isResending = true;
    this.hasError = false;

    // Resetear el OTP input
    if (this.otpInput) {
      this.otpInput.reset();
    }

    this.authService.resendCode(this.email).subscribe({
      next: (response) => {
        this.isResending = false;
        this.toastService.success(`Código reenviado exitosamente. ${response.expiresIn ? `Expira en ${response.expiresIn}` : 'Revisa tu email.'}`);
        
        Swal.fire({
          title: '¡Código Reenviado!',
          text: response.message || 'Se ha enviado un nuevo código de verificación a tu email.',
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-lg'
          }
        });
      },
      error: (error) => {
        this.isResending = false;
        const errorMessage = error.error?.message || 'Error al reenviar el código. Intenta nuevamente.';
        this.toastService.error(errorMessage);
        
        // Si el error es 401 o 403, puede ser que el email no sea válido o no sea profesor
        if (error.status === 401 || error.status === 403) {
          Swal.fire({
            title: 'Error al reenviar código',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#ef4444',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-lg'
            }
          });
        }
      }
    });
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
  }
}

