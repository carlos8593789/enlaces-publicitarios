import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { ProductosPedidoEntregaResponse } from '../models/producto-pedido-entrega.model';

@Injectable({
  providedIn: 'root'
})
export class ProductosPedidoEntregaService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/productos-pedido-entrega';

  constructor(private readonly http: HttpClient) {}

  getByClienteId(idCliente: number): Observable<ProductosPedidoEntregaResponse> {
    if (!idCliente || Number.isNaN(idCliente)) {
      return throwError(() => new Error('ID de cliente inválido.'));
    }

    const params = new HttpParams().set('id_cliente', String(idCliente));
    return this.http.get<ProductosPedidoEntregaResponse>(this.apiUrl, { params });
  }
}
