import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UpdateService } from './core/services/update.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'PWA_Angular';

  constructor(private updateService: UpdateService) {}

  ngOnInit(): void {
    // El servicio de actualización se inicializa automáticamente en su constructor
    // Esto asegura que se detecten las actualizaciones cuando la app inicia
  }
}
