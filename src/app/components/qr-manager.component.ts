import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { QRManagerService, QRPokemon } from '../core/services/qr-manager.service';
import * as QRCode from 'qrcode';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-qr-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatGridListModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="space-y-8 fade-in">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          QR Manager Pokémon
        </h1>
        <p class="text-gray-600 text-lg">Genera códigos QR para Pokémon</p>
      </div>
      
      <!-- Generator Form -->
      <div class="glass-card p-6">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <mat-icon class="text-white">qr_code</mat-icon>
          </div>
          <h3 class="text-xl font-semibold text-gray-800">Generador de Códigos QR</h3>
        </div>
        
        <form [formGroup]="qrForm" (ngSubmit)="generateQRs()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <mat-form-field appearance="outline">
              <mat-label>ID Mínimo</mat-label>
              <input matInput type="number" formControlName="minId" placeholder="1" class="text-gray-800">
              <mat-icon matPrefix class="text-gray-400 mr-2">looks_one</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>ID Máximo</mat-label>
              <input matInput type="number" formControlName="maxId" placeholder="151" class="text-gray-800">
              <mat-icon matPrefix class="text-gray-400 mr-2">looks_two</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Rareza</mat-label>
              <mat-select formControlName="rarity">
                <mat-option value="">Todas</mat-option>
                <mat-option value="common">Común</mat-option>
                <mat-option value="rare">Raro</mat-option>
                <mat-option value="epic">Épico</mat-option>
                <mat-option value="legend">Legendario</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          
          <button 
            mat-raised-button 
            type="submit"
            class="pokemon-btn text-lg py-3"
            [disabled]="qrForm.invalid || isLoading"
          >
            <span *ngIf="isLoading" class="flex items-center">
              <mat-spinner diameter="20" class="mr-2 inline-block"></mat-spinner>
              Generando...
            </span>
            <span *ngIf="!isLoading" class="flex items-center">
              <mat-icon class="mr-2">qr_code</mat-icon>
              Generar Códigos QR
            </span>
          </button>
        </form>
      </div>
      
      <!-- Error Message -->
      <div *ngIf="errorMessage" class="glass-card p-4 bg-red-50 border border-red-200">
        <div class="flex items-center space-x-2 text-red-600">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
      </div>
      
      <!-- Generated QR Codes -->
      <div *ngIf="generatedQRs.length > 0" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <h3 class="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Códigos QR Generados ({{ generatedQRs.length }})
          </h3>
          <button mat-raised-button class="pokemon-btn" (click)="exportPDF()">
            <mat-icon class="mr-2">picture_as_pdf</mat-icon>
            Exportar PDF
          </button>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div *ngFor="let qr of generatedQRs" class="glass-card p-4 hover:scale-105 transition-transform duration-300">
            <div class="text-center">
              <div class="w-24 h-24 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg border-2 border-gray-200">
                <img [src]="qr.qrCodeDataUrl" [alt]="'QR Code for ' + qr.name" class="w-20 h-20">
              </div>
              <h4 class="font-semibold text-gray-800 mb-1">{{ qr.name }}</h4>
              <p class="text-sm text-gray-600 mb-2">ID: {{ qr.id }}</p>
              <span 
                class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                [class.rarity-common]="qr.rarity === 'common'"
                [class.rarity-rare]="qr.rarity === 'rare'"
                [class.rarity-epic]="qr.rarity === 'epic'"
                [class.rarity-legend]="qr.rarity === 'legend'"
              >
                {{ qr.rarity }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class QrManagerComponent implements OnInit {
  qrForm: FormGroup;
  generatedQRs: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private qrManagerService: QRManagerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.qrForm = this.fb.group({
      minId: [1, [Validators.required, Validators.min(1)]],
      maxId: [151, [Validators.required, Validators.min(1)]],
      rarity: ['']
    });
  }

  ngOnInit() {
    // Leer query params de la URL
    this.route.queryParams.subscribe(params => {
      const minId = params['minId'] ? parseInt(params['minId'], 10) : null;
      const maxId = params['maxId'] ? parseInt(params['maxId'], 10) : null;
      const rarity = params['rarity'] || '';

      // Si hay query params (al menos minId o maxId), actualizar el formulario y generar QR
      const hasQueryParams = minId !== null || maxId !== null || (rarity && rarity !== '');
      
      if (hasQueryParams) {
        // Actualizar formulario con los valores de query params
        const formValues: any = {};
        if (minId !== null) {
          formValues.minId = minId;
        }
        if (maxId !== null) {
          formValues.maxId = maxId;
        }
        if (rarity && rarity !== '') {
          formValues.rarity = rarity;
        }
        this.qrForm.patchValue(formValues);

        // Generar QR automáticamente con los parámetros de la URL
        const finalMinId = minId || this.qrForm.value.minId || 1;
        const finalMaxId = maxId || this.qrForm.value.maxId || 151;
        const finalRarity = rarity && rarity !== '' ? rarity : undefined;
        
        this.generateQRsFromBackend(finalMinId, finalMaxId, finalRarity);
      }
    });
  }

  async generateQRs() {
    if (this.qrForm.valid) {
      const { minId, maxId, rarity } = this.qrForm.value;
      
      // Actualizar URL con los parámetros del formulario
      const queryParams: any = { minId, maxId };
      if (rarity && rarity !== '') {
        queryParams.rarity = rarity;
      }
      
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge'
      });

      // Generar QR desde el backend
      await this.generateQRsFromBackend(minId, maxId, rarity || undefined);
    }
  }

  private async generateQRsFromBackend(minId: number, maxId: number, rarity?: string) {
    this.isLoading = true;
    this.errorMessage = null;
    this.generatedQRs = [];

    try {
      // Llamar al backend
      const response = await firstValueFrom(
        this.qrManagerService.getQRPokemons(minId, maxId, rarity)
      );
      
      if (!response || !response.pokemons) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Generar QR codes para cada Pokémon
      for (const pokemon of response.pokemons) {
        try {
          // Generate QR code data URL
          const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(pokemon), {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });

          this.generatedQRs.push({
            ...pokemon,
            qrCodeDataUrl
          });
        } catch (error) {
          console.error('Error generating QR code for Pokémon', pokemon.id, ':', error);
        }
      }

      if (this.generatedQRs.length === 0) {
        this.errorMessage = 'No se encontraron Pokémon con los filtros especificados';
      }
    } catch (error: any) {
      console.error('Error fetching Pokémon data:', error);
      this.errorMessage = error?.error?.message || error?.message || 'Error al obtener los datos del servidor. Por favor, intenta de nuevo.';
      
      // Fallback: generar QR localmente si el backend falla
      await this.generateQRsLocally(minId, maxId, rarity);
    } finally {
      this.isLoading = false;
    }
  }

  private async generateQRsLocally(minId: number, maxId: number, rarity?: string) {
    console.warn('Usando generación local de QR como fallback');
    
    for (let id = minId; id <= maxId; id++) {
      const pokemonData = {
        id,
        name: `Pokémon ${id}`,
        rarity: rarity || 'common',
        timestamp: new Date().toISOString()
      };

      try {
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(pokemonData), {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        this.generatedQRs.push({
          ...pokemonData,
          qrCodeDataUrl
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
  }

  async exportPDF() {
    if (this.generatedQRs.length === 0) {
      alert('No hay códigos QR para exportar');
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const qrSize = 40; // Size of QR code in mm
      const spacing = 5; // Space between elements
      
      let x = margin;
      let y = margin;
      let itemsPerRow = 4;
      let currentRow = 0;
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('Códigos QR Pokémon', pageWidth / 2, y, { align: 'center' });
      y += 15;
      
      // Add date
      pdf.setFontSize(10);
      pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
      y += 10;
      
      // Process QR codes one by one to ensure images are loaded
      for (let i = 0; i < this.generatedQRs.length; i++) {
        const qr = this.generatedQRs[i];
        
        // Check if we need a new page
        if (y + qrSize + 20 > pageHeight - margin) {
          pdf.addPage();
          y = margin;
          currentRow = 0;
        }
        
        // Calculate position
        x = margin + (currentRow * (qrSize + spacing + 30));
        
        // Wait for image to load and add to PDF
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            pdf.addImage(img, 'PNG', x, y, qrSize, qrSize);
            
            // Add text below QR code
            pdf.setFontSize(8);
            pdf.text(qr.name, x + qrSize/2, y + qrSize + 5, { align: 'center' });
            pdf.text(`ID: ${qr.id}`, x + qrSize/2, y + qrSize + 8, { align: 'center' });
            pdf.text(qr.rarity.toUpperCase(), x + qrSize/2, y + qrSize + 11, { align: 'center' });
            
            resolve();
          };
          img.src = qr.qrCodeDataUrl;
        });
        
        currentRow++;
        
        // Move to next row if needed
        if (currentRow >= itemsPerRow) {
          currentRow = 0;
          y += qrSize + 20;
        }
      }
      
      // Save the PDF
      pdf.save(`pokemon-qr-codes-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Inténtalo de nuevo.');
    }
  }
}
