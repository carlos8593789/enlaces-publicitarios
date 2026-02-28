export interface PedidoEntregaColor {
  cantidad_pendiente: number;
  cantidad_remisionada: number;
  control_almacen: string;
  imagen: string;
  color_producto: string;
  cantidad_color: string;
}

export interface PedidoEntregaDetalleApi {
  id: number;
  id_pedido: number;
  clave: string;
  proveedor_producto_estatus: string;
  producto_color_cantidad: string;
  id_producto: number;
  colores: PedidoEntregaColor[];
}

export interface PedidoEntregaApi {
  id: number;
  id_cliente: number;
  total: number;
  estatus: number;
  detalles: PedidoEntregaDetalleApi[];
}

export interface PedidoEntregaDetalle {
  id: number;
  id_pedido: number;
  clave: string;
  proveedor_producto_estatus: string;
  producto_color_cantidad: string;
  id_producto: number;
  cantidad_pendiente: number;
  cantidad_remisionada: number;
  control_almacen: string;
  imagen: string;
  color_producto: string;
  cantidad_color: string;
}

export interface PedidoEntrega {
  id: number;
  id_cliente: number;
  total: number;
  estatus: number;
  detalles: PedidoEntregaDetalle[];
}

export interface ProductosPedidoEntregaApiResponse {
  data: PedidoEntregaApi[];
}

export interface ProductosPedidoEntregaResponse {
  data: PedidoEntrega[];
}
