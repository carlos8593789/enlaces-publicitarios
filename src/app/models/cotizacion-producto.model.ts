export interface CotizacionProducto {
  id: number;
  clave: string;
  bbb: number;
  aplica_regla: number;
  descripcioncorta: string;
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
  descripcion?: string;
  precioUnitario: number;
  montoReglaNegocio: number;
  coloresSeleccionados?: CotizacionColorSeleccion[];
  tecnicasImpresion?: import('./tecnicas-impresion.model').TecnicaImpresionSeleccion[];
}
