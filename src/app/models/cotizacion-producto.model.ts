export interface CotizacionProducto {
  id: number;
  value: string;
  label: string;
  imagen: string;
  id_almacen: number;
}

export interface CotizacionColorSeleccion {
  color: string;
  cantidad: number;
}

export interface CotizacionLinea extends CotizacionProducto {
  cantidad: number;
  precioUnitario: number;
  montoReglaNegocio: number;
  coloresSeleccionados?: CotizacionColorSeleccion[];
  tecnicasImpresion?: import('./tecnicas-impresion.model').TecnicaImpresionSeleccion[];
}
