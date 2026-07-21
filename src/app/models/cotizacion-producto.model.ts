export interface CotizacionProducto {
  id: number;
  clave: string;
  nombre: string;
  precioUnitario: number;
  imagen: string;
  id_almacen: number;
}

export interface CotizacionColorSeleccion {
  color: string;
  cantidad: number;
}

export interface CotizacionLinea extends CotizacionProducto {
  cantidad: number;
  coloresSeleccionados?: CotizacionColorSeleccion[];
}
