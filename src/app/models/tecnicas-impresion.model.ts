export interface TecnicaImpresionApiItem {
  numero: string;
  imagen: string;
  id_tecnica: number;
  nombre: string;
  cantidad_posiciones: number;
  cantidad_tintas: number;
  consideraciones: string;
  descripcion: string;
}

export interface TecnicaImpresionSeleccion extends TecnicaImpresionApiItem {
  seleccionada: boolean;
  piezasSeleccionadas: number;
  tintasSeleccionadas: number;
  posicionesSeleccionadas: number;
  color: string;
  detalles: string;
  nota: string;
  precioUnitario?: number;
  precioUnitarioBase?: number;
  porcentajeDescuento?: number;
  notaDescuento?: string;
  cargoExtra?: number;
}