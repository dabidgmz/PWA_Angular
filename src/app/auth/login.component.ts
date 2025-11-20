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
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div class="w-full max-w-md">
        <!-- Logo Section -->
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <mat-icon class="text-white text-4xl">biotech</mat-icon>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Profesor Oak</h1>
          <p class="text-gray-600">Panel de Administración Pokémon</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input 
                matInput 
                type="email" 
                formControlName="email" 
                placeholder="professor@pokemon.com"
                autocomplete="email"
                class="text-gray-800"
              >
              <mat-icon matPrefix class="text-gray-400 mr-2">email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                El email es requerido
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Email inválido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Contraseña</mat-label>
              <input 
                matInput 
                [type]="hidePassword ? 'password' : 'text'" 
                formControlName="password" 
                placeholder="••••••••"
                autocomplete="current-password"
                class="text-gray-800"
              >
              <mat-icon matPrefix class="text-gray-400 mr-2">lock</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hidePassword"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                La contraseña es requerida
              </mat-error>
            </mat-form-field>

            <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-center space-x-2">
                <mat-icon class="text-red-500">error</mat-icon>
                <p class="text-red-700 text-sm">{{ errorMessage }}</p>
              </div>
            </div>

            <button 
              mat-raised-button 
              type="submit"
              class="w-full pokemon-btn text-lg py-3"
              [disabled]="loginForm.invalid || isLoading"
            >
              <mat-icon *ngIf="!isLoading" class="mr-2">login</mat-icon>
              <span *ngIf="isLoading" class="mr-2">Cargando...</span>
              <span *ngIf="!isLoading">Iniciar Sesión</span>
            </button>
          </form>

          <!-- Demo Credentials -->
          <div class="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p class="text-xs font-semibold text-blue-800 mb-2">Credenciales de Demo:</p>
            <div class="text-xs text-blue-700 space-y-1">
              <p><strong>Profesor:</strong> professor&#64;pokemon.com / professor123</p>
              <p><strong>Trainer:</strong> ash&#64;pokemon.com / ash123</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-gray-500 text-sm mt-6">
          Sistema de Gestión Pokémon © 2024
        </p>
      </div>
    </div>
  `
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
          this.toastService.success(`Bienvenido, ${response.user.name}`);
          
          // Redirigir según el rol
          if (response.user.role === 'profesor' || response.user.role === 'professor') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
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
