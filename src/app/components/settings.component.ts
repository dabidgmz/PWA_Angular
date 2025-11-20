import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToastService } from '../core/services/toast.service';
import { AdminService, ProfessorProfile, UpdateProfessorProfileRequest } from '../core/services/admin.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="space-y-8 fade-in">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Configuración
        </h1>
        <p class="text-gray-600 text-lg">Ajustes del sistema Pokémon</p>
      </div>
      
      <!-- Professor Profile -->
      <div class="glass-card p-6">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <mat-icon class="text-white">account_circle</mat-icon>
          </div>
          <h3 class="text-xl font-semibold text-gray-800">Perfil del Profesor</h3>
        </div>
        
        <div *ngIf="professorProfile" class="space-y-4">
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Nombre</mat-label>
                <input 
                  matInput 
                  formControlName="name" 
                  placeholder="Nombre completo" 
                  [readonly]="isUpdatingProfile"
                  class="text-gray-800">
                <mat-icon matPrefix class="text-gray-400 mr-2">person</mat-icon>
                <mat-error *ngIf="profileForm.get('name')?.hasError('required')">
                  El nombre es requerido
                </mat-error>
                <mat-error *ngIf="profileForm.get('name')?.hasError('minlength')">
                  El nombre debe tener al menos 3 caracteres
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Email</mat-label>
                <input 
                  matInput 
                  formControlName="email" 
                  type="email" 
                  readonly 
                  class="text-gray-500 bg-gray-50">
                <mat-icon matPrefix class="text-gray-400 mr-2">email</mat-icon>
                <mat-hint>El email no se puede modificar</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Teléfono</mat-label>
                <input 
                  matInput 
                  formControlName="phone" 
                  placeholder="555-1234" 
                  [readonly]="isUpdatingProfile"
                  class="text-gray-800">
                <mat-icon matPrefix class="text-gray-400 mr-2">phone</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Género</mat-label>
                <mat-select 
                  formControlName="gender"
                  [disabled]="isUpdatingProfile">
                  <mat-option value="">No especificado</mat-option>
                  <mat-option value="male">Masculino</mat-option>
                  <mat-option value="female">Femenino</mat-option>
                  <mat-option value="other">Otro</mat-option>
                </mat-select>
                <mat-icon matPrefix class="text-gray-400 mr-2">wc</mat-icon>
              </mat-form-field>
            </div>
            
            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
              <div class="text-sm text-gray-600">
                <p>Cuenta creada: {{ professorProfile.createdAt | date:'short' }}</p>
                <p *ngIf="professorProfile.isVerified" class="text-green-600">
                  <mat-icon class="text-sm align-middle">verified</mat-icon>
                  Email verificado
                </p>
              </div>
              <button 
                mat-raised-button 
                type="submit"
                class="pokemon-btn"
                [disabled]="profileForm.invalid || isUpdatingProfile || !profileForm.dirty || profileForm.pristine">
                <mat-icon class="mr-2">save</mat-icon>
                <span *ngIf="!isUpdatingProfile">Guardar Cambios</span>
                <span *ngIf="isUpdatingProfile">Guardando...</span>
              </button>
              
              <button 
                *ngIf="profileForm.dirty"
                mat-button 
                type="button"
                (click)="cancelEdit()"
                class="ml-2 text-gray-600">
                <mat-icon class="mr-2">cancel</mat-icon>
                Cancelar
              </button>
            </div>
          </form>
        </div>
        
        <div *ngIf="!professorProfile && !isLoadingProfile" class="text-center py-8 text-gray-500">
          <mat-icon class="text-4xl mb-2">error_outline</mat-icon>
          <p>No se pudo cargar el perfil del profesor</p>
        </div>
        
        <div *ngIf="isLoadingProfile" class="text-center py-8">
          <mat-icon class="text-4xl mb-2 animate-spin">refresh</mat-icon>
          <p class="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  professorProfile: ProfessorProfile | null = null;
  profileForm: FormGroup;
  isLoadingProfile = false;
  isUpdatingProfile = false;

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private adminService: AdminService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }],
      phone: [''],
      gender: ['']
    });
  }

  ngOnInit() {
    // Cargar perfil del profesor
    this.loadProfessorProfile();
  }
  
  loadProfessorProfile() {
    if (this.authService.isProfessor()) {
      this.isLoadingProfile = true;
      this.adminService.getProfessorProfile().subscribe({
        next: (profile) => {
          this.professorProfile = profile;
          // Guardar en cache después de cargar
          this.saveToCache(profile);
          // Actualizar valores del formulario
          this.updateFormValues(profile);
          this.isLoadingProfile = false;
          
          // Si no hay conexión, mostrar mensaje
          if (!navigator.onLine) {
            this.toastService.warning('Mostrando perfil desde caché. Conecta a internet para actualizar.');
          }
        },
        error: (error) => {
          console.error('Error loading professor profile:', error);
          
          // Intentar cargar desde cache si hay error
          const cachedProfile = this.getCachedProfile();
          if (cachedProfile) {
            this.professorProfile = cachedProfile;
            this.updateFormValues(cachedProfile);
            this.toastService.warning('Mostrando perfil desde caché. No hay conexión a internet.');
          } else {
            this.toastService.error('Error al cargar el perfil del profesor');
          }
          
          this.isLoadingProfile = false;
        }
      });
    }
  }
  
  private updateFormValues(profile: ProfessorProfile) {
    this.profileForm.patchValue({
      name: profile.name,
      phone: profile.phone || '',
      gender: profile.gender || ''
    }, { emitEvent: false });
    
    // Actualizar email (campo deshabilitado) directamente
    const emailControl = this.profileForm.get('email');
    if (emailControl) {
      emailControl.setValue(profile.email, { emitEvent: false });
    }
    
    // Marcar el formulario como pristine
    this.profileForm.markAsPristine();
  }
  
  private getCachedProfile(): ProfessorProfile | null {
    try {
      const cached = localStorage.getItem('professor_profile_cache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        // Verificar que no esté expirado (7 días)
        const cacheDate = new Date(cacheData.cachedAt);
        const daysDiff = (new Date().getTime() - cacheDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) {
          return cacheData.data;
        }
      }
    } catch (error) {
      console.error('Error reading cached profile:', error);
    }
    return null;
  }
  
  updateProfile() {
    if (this.profileForm.valid && this.professorProfile) {
      this.isUpdatingProfile = true;
      const updateData: UpdateProfessorProfileRequest = {
        name: this.profileForm.get('name')?.value,
        phone: this.profileForm.get('phone')?.value || null,
        gender: this.profileForm.get('gender')?.value || null
      };
      
      this.adminService.updateProfessorProfile(updateData).subscribe({
        next: (response) => {
          this.professorProfile = response.profesor;
          
          // Guardar en cache después de actualizar
          this.saveToCache(response.profesor);
          
          // Actualizar el formulario con los nuevos valores
          this.updateFormValues(response.profesor);
          
          this.toastService.success('Perfil actualizado exitosamente');
          this.isUpdatingProfile = false;
          
          // Actualizar el usuario en el AuthService
          if (this.authService.user) {
            this.authService.updateUser({
              name: response.profesor.name,
              email: response.profesor.email
            });
          }
        },
        error: (error) => {
          console.error('Error updating professor profile:', error);
          this.isUpdatingProfile = false;
          this.toastService.error(error.error?.message || 'Error al actualizar el perfil');
        }
      });
    }
  }
  
  cancelEdit() {
    if (this.professorProfile) {
      // Resetear el formulario a los valores originales
      this.profileForm.patchValue({
        name: this.professorProfile.name,
        phone: this.professorProfile.phone || '',
        gender: this.professorProfile.gender || ''
      }, { emitEvent: false });
      
      const emailControl = this.profileForm.get('email');
      if (emailControl) {
        emailControl.setValue(this.professorProfile.email, { emitEvent: false });
      }
      
      this.profileForm.markAsPristine();
      this.profileForm.updateValueAndValidity();
    }
  }
  
  private saveToCache(profile: ProfessorProfile): void {
    try {
      const cacheData = {
        data: profile,
        cachedAt: new Date().toISOString()
      };
      localStorage.setItem('professor_profile_cache', JSON.stringify(cacheData));
      
      // También guardar en service worker cache si está disponible
      if ('serviceWorker' in navigator && 'caches' in window) {
        caches.open('pokemon-cache-v1').then(cache => {
          const request = new Request('http://localhost:3333/profesores/me');
          const response = new Response(JSON.stringify(profile), {
            headers: { 'Content-Type': 'application/json' }
          });
          cache.put(request, response);
        }).catch(err => {
          console.error('Error saving to service worker cache:', err);
        });
      }
    } catch (error) {
      console.error('Error saving profile to cache:', error);
    }
  }
}
