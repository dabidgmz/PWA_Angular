import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfessorGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.authService.user$.pipe(
      take(1),
      map((user) => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        const isProfessor = user.role === 'profesor' || user.role === 'professor';
        
        if (!isProfessor) {
          this.router.navigate(['/dashboard']);
          return false;
        }

        return true;
      })
    );
  }
}
