import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';

import {
  PedidoEntrega,
  PedidoEntregaDetalle,
  ProductosPedidoEntregaApiResponse,
  ProductosPedidoEntregaResponse
} from '../models/producto-pedido-entrega.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductosPedidoEntregaService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/productos-pedido-entrega`;

  constructor(private readonly http: HttpClient) {}

  getByClienteId(idCliente: number): Observable<ProductosPedidoEntregaResponse> {
    if (!idCliente || Number.isNaN(idCliente)) {
      return throwError(() => new Error('ID de cliente inválido.'));
    }

    const params = new HttpParams().set('id_cliente', String(idCliente));
    return this.http
      .get<ProductosPedidoEntregaApiResponse>(this.apiUrl, { params })
      .pipe(map((response) => this.normalizeResponse(response)));
  }

  private normalizeResponse(response: ProductosPedidoEntregaApiResponse): ProductosPedidoEntregaResponse {
    const data = Array.isArray(response?.data)
      ? response.data.map((pedido): PedidoEntrega => {
          const detalles = Array.isArray(pedido.detalles)
            ? pedido.detalles.flatMap((detalle): PedidoEntregaDetalle[] => {
                if (!Array.isArray(detalle.colores) || detalle.colores.length === 0) {
                  return [
                    {
                      id: detalle.id,
                      id_pedido: detalle.id_pedido,
                      clave: detalle.clave,
                      proveedor_producto_estatus: detalle.proveedor_producto_estatus,
                      producto_color_cantidad: detalle.producto_color_cantidad,
                      id_producto: detalle.id_producto,
                      cantidad_pendiente: 0,
                      cantidad_remisionada: 0,
                      control_almacen: '',
                      imagen: '',
                      color_producto: '',
                      cantidad_color: '0'
                    }
                  ];
                }

                return detalle.colores.map((color): PedidoEntregaDetalle => ({
                  id: detalle.id,
                  id_pedido: detalle.id_pedido,
                  clave: detalle.clave,
                  proveedor_producto_estatus: detalle.proveedor_producto_estatus,
                  producto_color_cantidad: detalle.producto_color_cantidad,
                  id_producto: detalle.id_producto,
                  cantidad_pendiente: Number(color.cantidad_pendiente ?? 0),
                  cantidad_remisionada: Number(color.cantidad_remisionada ?? 0),
                  control_almacen: color.control_almacen ?? '',
                  imagen: color.imagen ?? '',
                  color_producto: color.color_producto ?? '',
                  cantidad_color: String(color.cantidad_color ?? '0')
                }));
              })
            : [];

          return {
            id: pedido.id,
            id_cliente: pedido.id_cliente,
            total: pedido.total,
            estatus: pedido.estatus,
            detalles
          };
        })
      : [];

    return { data };
  }
}
