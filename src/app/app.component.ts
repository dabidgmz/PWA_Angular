import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSnackBarModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'PWA_Angular';

  constructor(private swUpdate: SwUpdate, private snackBar: MatSnackBar) {
    if (!swUpdate.isEnabled) {
      console.log('[SW] Deshabilitado (dev / ng serve)');
      return;
    }

    console.log('[SW] Habilitado, escuchando updates');

    swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => {
        console.log('[SW] Nueva versión lista → mostrar snackbar');
        this.snackBar.open('Nueva versión disponible', 'Actualizar')
          .onAction()
          .subscribe(() => {
            console.log('[SW] Usuario acepta actualizar → recargando');
            window.location.reload();
          });
      });
  }

  ngOnInit(): void {}
}