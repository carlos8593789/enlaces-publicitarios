import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { ProductosRemisionSurtirResponse } from '../models/productos-remision-surtir.model';

@Injectable({
  providedIn: 'root'
})
export class ProductosRemisionSurtirService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/productos-remision-surtir';

  constructor(private readonly http: HttpClient) {}

  getByClienteId(idCliente: number): Observable<ProductosRemisionSurtirResponse> {
    if (!idCliente || Number.isNaN(idCliente)) {
      return throwError(() => new Error('ID de cliente inválido.'));
    }

    const params = new HttpParams().set('id_cliente', String(idCliente));
    return this.http.get<ProductosRemisionSurtirResponse>(this.apiUrl, { params });
  }
}
