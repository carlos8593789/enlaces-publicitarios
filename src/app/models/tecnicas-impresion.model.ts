export interface TecnicaImpresionApiItem {
  numero: string;
  imagen: string;
  id_tecnica: number;
  nombre: string;
  cantidad_posiciones: number;
  cantidad_tintas: number;
}

export interface TecnicaImpresionSeleccion extends TecnicaImpresionApiItem {
  seleccionada: boolean;
  piezasSeleccionadas: number;
  tintasSeleccionadas: number;
  posicionesSeleccionadas: number;
  precioUnitario?: number;
  cargoExtra?: number;
}