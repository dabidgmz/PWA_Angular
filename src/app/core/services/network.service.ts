import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private onlineStatusSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public onlineStatus$: Observable<boolean> = this.onlineStatusSubject.asObservable();

  constructor() {
    // Crear observables para eventos online/offline
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));
    
    // Merge de ambos eventos
    merge(online$, offline$)
      .subscribe((status) => {
        this.onlineStatusSubject.next(status);
      });
    
    // Estado inicial
    this.onlineStatusSubject.next(navigator.onLine);
  }

  get isOnline(): boolean {
    return this.onlineStatusSubject.value;
  }
}

