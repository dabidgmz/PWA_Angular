import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule],
  template: `
    <div class="otp-container flex gap-3 justify-center">
      <input
        *ngFor="let digit of digits; let i = index"
        #inputRef
        type="tel"
        maxlength="1"
        [(ngModel)]="digits[i]"
        (input)="onInput($event, i)"
        (keydown)="onKeyDown($event, i)"
        (paste)="onPaste($event)"
        class="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50"
        [class]="hasError ? 'border-red-500 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 bg-white text-gray-800 focus:border-blue-500 focus:ring-blue-500'"
      />
    </div>
  `,
  styles: [`
    .otp-container input {
      font-family: 'Inter', monospace;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .otp-container input:focus {
      transform: scale(1.05);
    }
  `]
})
export class OtpInputComponent implements AfterViewInit {
  @Input() hasError = false;
  @Output() completed = new EventEmitter<string>();

  digits: string[] = ['', '', '', '', '', ''];
  @ViewChild('inputRef') inputRef!: ElementRef;

  ngAfterViewInit() {
    // Focus first input
    setTimeout(() => {
      const firstInput = document.querySelector('.otp-container input') as HTMLInputElement;
      firstInput?.focus();
    }, 100);
  }

  onInput(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    if (value && index < 5) {
      const nextInput = document.querySelector(`.otp-container input:nth-child(${index + 2})`) as HTMLInputElement;
      nextInput?.focus();
    }

    this.checkCompletion();
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      const prevInput = document.querySelector(`.otp-container input:nth-child(${index})`) as HTMLInputElement;
      prevInput?.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    for (let i = 0; i < 6; i++) {
      this.digits[i] = digits[i] || '';
    }
    
    this.checkCompletion();
  }

  private checkCompletion(): void {
    const code = this.digits.join('');
    if (code.length === 6) {
      this.completed.emit(code);
    }
  }

  reset(): void {
    this.digits = ['', '', '', '', '', ''];
    const firstInput = document.querySelector('.otp-container input') as HTMLInputElement;
    firstInput?.focus();
  }
}
