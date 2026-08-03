import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface CrearCotizacionProductoPayload {
  id_producto: number;
  producto_color_cantidad: string;
  descripcion: string;
  porcentaje_descuento: number;
  cantidad: number;
  tecnicas_impresion?: CrearCotizacionTecnicaPayload[];
}

export interface CrearCotizacionTecnicaPayload {
  idTecnica: number;
  color: string;
  cantidad: number;
  tintas: number;
  posiciones: number;
  detalles: string;
  consideraciones: string;
  nota: string;
}

export interface CrearCotizacionPayload {
  id_cliente: number;
  observaciones: string;
  permitir_pago: boolean;
  riesgos: string;
  condiciones_venta: string;
  id_vendedor_sugerido: number;
  productos: CrearCotizacionProductoPayload[];
}

export interface CrearCotizacionResponse {
  success: boolean;
  message: string;
  data: {
    id_cotizacion: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CotizacionesService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/cotizaciones`;

  constructor(private readonly http: HttpClient) {}

  createCotizacion(payload: CrearCotizacionPayload): Observable<CrearCotizacionResponse> {
    return this.http.post<CrearCotizacionResponse>(this.apiUrl, payload);
  }
}
