import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScanCaptureRequest {
  pokemonId: number;
}

export interface ScanCaptureResponse {
  captureId: number;
  placement: 'team' | 'pc';
  pcBox?: number;
  pokemonInstanceId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CaptureService {
  private readonly API_URL = 'http://localhost:3333';

  constructor(private http: HttpClient) {}

  scanCapture(pokemonId: number): Observable<ScanCaptureResponse> {
    const request: ScanCaptureRequest = { pokemonId };
    return this.http.post<ScanCaptureResponse>(`${this.API_URL}/captures/scan`, request);
  }
}
