import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

import { environment } from '../../environments/environment';

export interface CondicionVentaItem {
  id: number;
  nombre: string;
  comentarios: string;
}

export interface CondicionesVentaResponse {
  success: boolean;
  message: string;
  data: CondicionVentaItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CondicionesVentaService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/catalogos/condiciones-venta`;

  constructor(private readonly http: HttpClient) {}

  getCondicionesVenta(): Observable<CondicionVentaItem[]> {
    return this.http.get<CondicionesVentaResponse>(this.apiUrl).pipe(
      map((response) => (Array.isArray(response?.data) ? response.data : [])),
      catchError(() => of([]))
    );
  }
}
