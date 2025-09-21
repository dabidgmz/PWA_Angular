import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pokemon-icon" [class]="sizeClass">
      <svg *ngIf="type === 'pokeball'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
      
      <svg *ngIf="type === 'trainer'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        <circle cx="12" cy="8" r="3"/>
      </svg>
      
      <svg *ngIf="type === 'trophy'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V7C19 8.1 18.1 9 17 9H15V10.59C15.73 10.91 16.35 11.41 16.79 12.04C17.18 12.61 17.39 13.27 17.39 13.95V15H19C19.55 15 20 15.45 20 16S19.55 17 19 17H17.39C17.39 17.73 17.18 18.39 16.79 18.96C16.35 19.59 15.73 20.09 15 20.41V22H9V20.41C8.27 20.09 7.65 19.59 7.21 18.96C6.82 18.39 6.61 17.73 6.61 17H5C4.45 17 4 16.55 4 16S4.45 15 5 15H6.61V13.95C6.61 13.27 6.82 12.61 7.21 12.04C7.65 11.41 8.27 10.91 9 10.59V9H7C5.9 9 5 8.1 5 7V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 6H15V4H9V6ZM7 7H17V6H7V7ZM9 9H15V10.59C14.27 10.91 13.65 11.41 13.21 12.04C12.82 12.61 12.61 13.27 12.61 13.95V15H11.39V13.95C11.39 13.27 11.18 12.61 10.79 12.04C10.35 11.41 9.73 10.91 9 10.59V9Z"/>
      </svg>
      
      <svg *ngIf="type === 'star'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
      </svg>
      
      <svg *ngIf="type === 'professor'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2ZM12 6.5L11.5 9L9 9.5L11.5 10L12 12.5L12.5 10L15 9.5L12.5 9L12 6.5Z"/>
        <circle cx="12" cy="12" r="1"/>
      </svg>
    </div>
  `,
  styles: [`
    .pokemon-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .pokemon-icon svg {
      width: 100%;
      height: 100%;
    }
    
    .size-small {
      width: 16px;
      height: 16px;
    }
    
    .size-medium {
      width: 24px;
      height: 24px;
    }
    
    .size-large {
      width: 32px;
      height: 32px;
    }
    
    .size-xl {
      width: 48px;
      height: 48px;
    }
    
    .size-2xl {
      width: 64px;
      height: 64px;
    }
  `]
})
export class PokemonIconComponent {
  @Input() type: 'pokeball' | 'trainer' | 'trophy' | 'star' | 'professor' = 'pokeball';
  @Input() size: 'small' | 'medium' | 'large' | 'xl' | '2xl' = 'medium';

  get sizeClass(): string {
    return `size-${this.size}`;
  }
}
