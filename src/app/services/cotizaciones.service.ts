import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface CotizacionColorPayload {
  color: string;
  cantidad: number;
}

export interface CrearCotizacionProductoPayload {
  id_producto: number;
  colores: CotizacionColorPayload[];
  descripcion: string;
  porcentaje_descuento: number;
  nota_descuento?: string;
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
  porcentaje_descuento?: number;
  nota_descuento?: string;
}

export interface CrearCotizacionPayload {
  id_cliente: number;
  observaciones: string;
  permitir_pago: boolean;
  riesgos: string;
  condiciones_venta: string;
  id_vendedor_sugerido?: number;
  productos: CrearCotizacionProductoPayload[];
}

export interface ActualizarCotizacionClientePayload {
  id?: number;
  nombre?: string;
  empresa?: string;
  email?: string;
  telefono?: string;
  movil?: string;
  razon_social?: string;
  direccion_fiscal?: string;
  rfc?: string;
}

// No admite id_vendedor_sugerido: la API responde con error de validacion.
// Si se envia `productos`, reemplaza por completo los productos y tecnicas anteriores.
export interface ActualizarCotizacionPayload {
  id_cliente?: number;
  cliente?: ActualizarCotizacionClientePayload;
  observaciones?: string;
  permitir_pago?: boolean;
  riesgos?: string;
  condiciones_venta?: string;
  productos?: CrearCotizacionProductoPayload[];
  estatus?: number | string;
  tipo?: number | string;
  id_motivo_cerrada?: number | null;
  fecha_cierre?: string | null;
  nota?: string;
}

export interface CrearCotizacionResponse {
  success: boolean;
  message: string;
  data: {
    id_cotizacion: number;
  };
}

export interface ActualizarCotizacionResponse {
  success: boolean;
  message: string;
  data?: {
    id_cotizacion?: number;
  };
}

export interface CotizacionDetalleProducto {
  id: number;
  clave: string;
  descripcioncorta: string;
  value: string;
  label: string;
  imagen: string;
  bbb: number;
  aplica_regla: number;
  id_almacen: number;
}

export type CotizacionDetalleTecnica = CrearCotizacionTecnicaPayload;

export interface CotizacionDetalleItem {
  id_producto: number;
  producto: CotizacionDetalleProducto;
  cantidad: number;
  descripcion: string;
  porcentaje_descuento: number;
  nota_descuento: string;
  colores: Array<{ color: string; cantidad: number }>;
  tecnicas_impresion: CotizacionDetalleTecnica[];
}

export interface CotizacionDetalle {
  id_cotizacion: number;
  id_cliente: number;
  cliente: {
    id: number;
    nombre: string;
    empresa: string;
    email: string;
  };
  observaciones: string;
  permitir_pago: boolean;
  riesgos: string;
  condiciones_venta: string;
  id_vendedor_sugerido: number;
  vendedor_sugerido: {
    id: number;
    nombre: string;
    correo: string;
  } | null;
  productos: CotizacionDetalleItem[];
}

export interface CotizacionDetalleResponse {
  success: boolean;
  message: string;
  data: CotizacionDetalle;
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

  getCotizacionById(idCotizacion: number): Observable<CotizacionDetalleResponse> {
    return this.http.get<CotizacionDetalleResponse>(`${this.apiUrl}/${idCotizacion}`);
  }

  updateCotizacion(idCotizacion: number, payload: ActualizarCotizacionPayload): Observable<ActualizarCotizacionResponse> {
    return this.http.put<ActualizarCotizacionResponse>(`${this.apiUrl}/${idCotizacion}`, payload);
  }
}
