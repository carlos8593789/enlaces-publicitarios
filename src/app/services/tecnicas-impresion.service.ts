import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { TecnicaImpresionApiItem } from '../models/tecnicas-impresion.model';

export interface TecnicasImpresionResponse {
  success: boolean;
  message: string;
  data: TecnicaImpresionApiItem[];
}

export interface TecnicaImpresionPrecioResponse {
  success: boolean;
  message: string;
  data: {
    precio: number;
    cargo_extra: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TecnicasImpresionService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/productos`;
  private readonly precioUrl = `${environment.apiBaseUrl}/api/tecnicas-impresion-precio`;

  constructor(private readonly http: HttpClient) {}

  getTecnicasImpresion(idProducto: number): Observable<TecnicasImpresionResponse> {
    if (!idProducto || Number.isNaN(idProducto)) {
      return of({ success: true, message: '', data: [] });
    }

    const endpoint = `${this.apiUrl}/${idProducto}/tecnicas-impresion`;

    return this.http.get<TecnicasImpresionResponse>(endpoint).pipe(
      catchError(() => of({ success: false, message: '', data: [] }))
    );
  }

  getPrecioTecnicaImpresion(
    idTecnica: number,
    cantidad: number,
    posiciones: number,
    tintas: number
  ): Observable<TecnicaImpresionPrecioResponse> {
    if (!idTecnica || Number.isNaN(idTecnica)) {
      return of({ success: false, message: '', data: { precio: 0, cargo_extra: 0 } });
    }

    const params = new HttpParams()
      .set('idTecnica', String(idTecnica))
      .set('cantidad', String(Math.max(0, Math.floor(Number(cantidad) || 0))))
      .set('posiciones', String(Math.max(0, Math.floor(Number(posiciones) || 0))))
      .set('tintas', String(Math.max(0, Math.floor(Number(tintas) || 0))));

    return this.http.get<TecnicaImpresionPrecioResponse>(this.precioUrl, { params }).pipe(
      catchError(() => of({ success: false, message: '', data: { precio: 0, cargo_extra: 0 } }))
    );
  }
}