import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="empty-state flex flex-col items-center justify-center py-12 text-center">
      <mat-icon class="text-6xl text-gray-400 mb-4">{{ icon }}</mat-icon>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">{{ title }}</h3>
      <p class="text-gray-500 max-w-md">{{ message }}</p>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Sin datos';
  @Input() message = 'No hay información disponible en este momento.';
}
