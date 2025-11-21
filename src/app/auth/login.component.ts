import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="login-container min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Animated Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-90">
        <div class="absolute inset-0 pattern-overlay opacity-20"></div>
      </div>
      
      <!-- Floating Pokeballs -->
      <div class="absolute top-20 left-10 w-16 h-16 opacity-20 animate-float">
        <div class="w-full h-full bg-white rounded-full border-4 border-black flex items-center justify-center">
          <div class="w-8 h-8 bg-white rounded-full border-2 border-black"></div>
        </div>
      </div>
      <div class="absolute bottom-20 right-10 w-12 h-12 opacity-20 animate-float-delayed">
        <div class="w-full h-full bg-white rounded-full border-4 border-black flex items-center justify-center">
          <div class="w-6 h-6 bg-white rounded-full border-2 border-black"></div>
        </div>
      </div>
      
      <div class="w-full max-w-md relative z-10">
        <!-- Logo Section -->
        <div class="text-center mb-10 animate-fade-in">
          <div class="w-28 h-28 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300 relative">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl blur-xl opacity-50"></div>
            <mat-icon class="text-white text-5xl relative z-10">biotech</mat-icon>
          </div>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-3 drop-shadow-lg">
            Profesor Oak
          </h1>
          <p class="text-white text-lg font-medium opacity-90">Panel de Administración Pokémon</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 animate-slide-up">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Iniciar Sesión
            </h2>
            <p class="text-gray-600">Ingresa tus credenciales para continuar</p>
          </div>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label class="text-gray-700 font-medium">Email</mat-label>
              <input 
                matInput 
                type="email" 
                formControlName="email" 
                placeholder="professor@pokemon.com"
                autocomplete="email"
                class="text-gray-800 text-lg"
              >
              <mat-icon matPrefix class="text-blue-500 mr-3 text-xl">email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                El email es requerido
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Email inválido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label class="text-gray-700 font-medium">Contraseña</mat-label>
              <input 
                matInput 
                [type]="hidePassword ? 'password' : 'text'" 
                formControlName="password" 
                placeholder="••••••••"
                autocomplete="current-password"
                class="text-gray-800 text-lg"
              >
              <mat-icon matPrefix class="text-purple-500 mr-3 text-xl">lock</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hidePassword"
                class="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                La contraseña es requerida
              </mat-error>
            </mat-form-field>

            <div *ngIf="errorMessage" class="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-shake">
              <div class="flex items-center space-x-3">
                <mat-icon class="text-red-500">error</mat-icon>
                <p class="text-red-700 text-sm font-medium">{{ errorMessage }}</p>
              </div>
            </div>

            <button 
              mat-raised-button 
              type="submit"
              class="w-full login-button text-lg py-4 rounded-xl font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              [disabled]="loginForm.invalid || isLoading"
            >
              <span *ngIf="isLoading" class="flex items-center justify-center">
                <mat-icon class="animate-spin mr-2">refresh</mat-icon>
                Iniciando sesión...
              </span>
              <span *ngIf="!isLoading" class="flex items-center justify-center">
                <mat-icon class="mr-2">login</mat-icon>
                Iniciar Sesión
              </span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <p class="text-center text-white/80 text-sm mt-8 font-medium">
          Sistema de Gestión Pokémon © 2024
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      position: relative;
    }
    
    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(180deg);
      }
    }
    
    @keyframes float-delayed {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-15px) rotate(-180deg);
      }
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
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    .animate-float-delayed {
      animation: float-delayed 8s ease-in-out infinite;
    }
    
    .animate-fade-in {
      animation: fade-in 0.8s ease-out;
    }
    
    .animate-slide-up {
      animation: slide-up 0.6s ease-out;
    }
    
    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
    
    .pattern-overlay {
      background-image: 
        radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0);
      background-size: 20px 20px;
    }
    
    .login-button {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
      color: white !important;
      border: none !important;
    }
    
    .login-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%) !important;
      box-shadow: 0 20px 40px rgba(59, 130, 246, 0.4) !important;
    }
    
    .login-button:disabled {
      background: #9ca3af !important;
    }
    
    ::ng-deep .mat-mdc-form-field {
      .mat-mdc-text-field-wrapper {
        background-color: rgba(249, 250, 251, 0.8);
        border-radius: 12px;
      }
      
      .mat-mdc-form-field-focus-overlay {
        background-color: transparent;
      }
      
      &.mat-focused .mat-mdc-text-field-wrapper {
        background-color: white;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Si requiere código de verificación, redirigir a la página de verificación
          if (response.requiresCode) {
            this.toastService.info('Código de verificación enviado a tu email');
            this.router.navigate(['/verify-code'], {
              queryParams: { email: email },
              state: { email: email }
            });
          } else if (response.token) {
            // Si no requiere código, login directo
            this.toastService.success(`Bienvenido, ${response.user.name}`);
            
            // Redirigir según el rol
            if (response.user.role === 'profesor' || response.user.role === 'professor') {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
          this.toastService.error(this.errorMessage);
        }
      });
    }
  }
}
