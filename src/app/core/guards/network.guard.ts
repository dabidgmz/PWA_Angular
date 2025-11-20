import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { NetworkService } from '../services/network.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkGuard implements CanActivate {
  constructor(
    private networkService: NetworkService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.networkService.onlineStatus$.pipe(
      take(1),
      map((isOnline) => {
        if (!isOnline) {
          // Si no hay conexión, redirigir a la página offline
          this.router.navigate(['/offline']);
          return false;
        }
        return true;
      })
    );
  }
}

