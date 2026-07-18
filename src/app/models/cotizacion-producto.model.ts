export interface CotizacionProducto {
  id: number;
  clave: string;
  nombre: string;
  precioUnitario: number;
  imagen: string;
}

export interface CotizacionLinea extends CotizacionProducto {
  cantidad: number;
}
