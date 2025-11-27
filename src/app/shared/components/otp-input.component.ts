import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatFormFieldModule],
  template: `
    <div class="otp-container">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Código de 6 dígitos</mat-label>
        <input
          #codeInput
          matInput
          type="tel"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="6"
          [(ngModel)]="code"
          (input)="onInput($event)"
          (paste)="onPaste($event)"
          class="text-center text-3xl font-bold tracking-widest"
          [class]="hasError ? 'error-input' : ''"
          placeholder="000000"
        />
      </mat-form-field>
    </div>
  `,
  styles: [`
    .otp-container {
      width: 100%;
      max-width: 300px;
    }
    
    .otp-container ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }
    
    .otp-container ::ng-deep .mat-mdc-text-field-wrapper {
      padding: 8px 16px;
    }
    
    .otp-container ::ng-deep input {
      font-family: 'Inter', monospace;
      letter-spacing: 0.5em !important;
      text-align: center;
    }
    
    .otp-container ::ng-deep .error-input {
      color: #dc2626;
    }
    
    .otp-container ::ng-deep .mat-mdc-form-field.mat-form-field-invalid .mat-mdc-text-field-wrapper {
      border-color: #dc2626;
    }
  `]
})
export class OtpInputComponent implements AfterViewInit {
  @Input() hasError = false;
  @Output() completed = new EventEmitter<string>();
  @Output() codeChange = new EventEmitter<string>();

  code = '';
  @ViewChild('codeInput') codeInput!: ElementRef;

  ngAfterViewInit() {
    // Focus en el input
    setTimeout(() => {
      if (this.codeInput?.nativeElement) {
        this.codeInput.nativeElement.focus();
      }
    }, 100);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value;
    
    // Solo permitir números
    value = value.replace(/\D/g, '');
    
    // Limitar a 6 dígitos
    if (value.length > 6) {
      value = value.slice(0, 6);
    }
    
    // Actualizar el código
    this.code = value;
    target.value = value;
    
    // Emitir cambios
    this.codeChange.emit(this.code);
    
    // Si está completo, emitir evento
    if (this.code.length === 6) {
      this.completed.emit(this.code);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, 6);
    
    this.code = digitsOnly;
    const target = event.target as HTMLInputElement;
    target.value = digitsOnly;
    
    this.codeChange.emit(this.code);
    
    if (this.code.length === 6) {
      this.completed.emit(this.code);
    }
  }

  getCode(): string {
    return this.code;
  }

  reset(): void {
    this.code = '';
    if (this.codeInput?.nativeElement) {
      this.codeInput.nativeElement.value = '';
      setTimeout(() => {
        this.codeInput.nativeElement.focus();
      }, 100);
    }
  }
}
