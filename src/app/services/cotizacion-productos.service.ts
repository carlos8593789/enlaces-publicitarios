import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

import { environment } from '../../environments/environment';

export interface ProductoStockAlmacenItem {
  nombre: string;
  local: number;
  estatus: number;
  cantidad: number;
  diasLlegada: number;
  horaCierre: string;
}

export interface ProductoStockColor {
  color: string;
  imagen: string;
  total: number;
  stock: ProductoStockAlmacenItem[];
}

export interface ProductoStockDetalle {
  almacenes: ProductoStockColor[];
  stockLocal: number;
}

export interface ProductoBusquedaResponse {
  data?: Array<{
    id: number;
    value: string;
    label: string;
    imagen?: string;
    id_almacen?: number;
  }>;
}

export interface ProductoPrecioResponse {
  data?: {
    precio?: number;
    monto_regla_negocio?: number;
  };
}

export interface ProductoStockResponse {
  data?: {
    almacenes?: Array<{
      color?: string;
      imagen?: string;
      almacen?: {
        total?: number;
        stock?: Array<{
          nombre?: string;
          local?: number;
          estatus?: number;
          cantidad?: number;
          dias_llegada?: number;
          hora_cierre?: string;
        }>;
      };
    }>;
    stockLocal?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CotizacionProductosService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/productos-buscar`;
  private readonly productosUrl = `${environment.apiBaseUrl}/api/productos`;
  private readonly precioUrl = `${environment.apiBaseUrl}/api/productos-precio`;

  constructor(private readonly http: HttpClient) {}

  searchProductos(termino: string): Observable<ProductoBusquedaResponse> {
    const params = new HttpParams().set('term', termino.trim());

    return this.http.get<ProductoBusquedaResponse>(this.apiUrl, { params }).pipe(
      catchError(() => of({ data: [] }))
    );
  }

  getProductoStock(idProducto: number): Observable<ProductoStockResponse> {
    if (!idProducto || Number.isNaN(idProducto)) {
      return of({ data: { almacenes: [], stockLocal: 0 } });
    }

    const endpoint = `${this.productosUrl}/${idProducto}/stock`;

    return this.http.get<ProductoStockResponse>(endpoint).pipe(
      catchError(() => of({ data: { almacenes: [], stockLocal: 0 } }))
    );
  }

  getProductoPrecio(
    productoId: number,
    idCliente: number,
    cantidad: number,
    idAlmacenes: number[] = []
  ): Observable<ProductoPrecioResponse> {
    if (!productoId || Number.isNaN(productoId) || !idCliente || Number.isNaN(idCliente)) {
      return of({ data: { precio: 0 } });
    }

    const cantidadNormalizada = Number.isFinite(cantidad) ? Math.max(1, Math.floor(cantidad)) : 1;
    const idsAlmacenesNormalizados = Array.from(
      new Set(
        idAlmacenes
          .map((idAlmacen) => Number(idAlmacen))
          .filter((idAlmacen) => Number.isFinite(idAlmacen) && idAlmacen > 0)
      )
    );

    let params = new HttpParams()
      .set('productoId', String(productoId))
      .set('idCliente', String(idCliente))
      .set('cantidad', String(cantidadNormalizada));

    idsAlmacenesNormalizados.forEach((idAlmacen) => {
      params = params.append('idAlmacenes[]', String(idAlmacen));
    });

    return this.http.get<ProductoPrecioResponse>(this.precioUrl, { params }).pipe(catchError(() => of({ data: { precio: 0 } })));
  }

}
