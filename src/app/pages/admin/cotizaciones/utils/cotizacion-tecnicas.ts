import { TecnicaImpresionSeleccion } from '../../../../models/tecnicas-impresion.model';

function enteroNoNegativo(valor: number): number {
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.max(0, Math.floor(numero)) : 0;
}

export function alternarTecnica(
  item: TecnicaImpresionSeleccion,
  seleccionada: boolean,
  piezasIniciales: number
): void {
  item.seleccionada = seleccionada;

  if (seleccionada) {
    item.piezasSeleccionadas = piezasIniciales;
    item.tintasSeleccionadas = item.cantidad_tintas > 0 ? Math.max(1, item.tintasSeleccionadas || 1) : 0;
    item.posicionesSeleccionadas = item.cantidad_posiciones > 0 ? Math.max(1, item.posicionesSeleccionadas || 1) : 0;
    return;
  }

  item.piezasSeleccionadas = 0;
  item.tintasSeleccionadas = 0;
  item.posicionesSeleccionadas = 0;
  item.color = '';
  item.nota = '';
}

export function crearInstanciaTecnica(
  item: TecnicaImpresionSeleccion,
  instanciaId: number,
  piezas: number
): TecnicaImpresionSeleccion {
  return {
    ...item,
    instanciaId,
    seleccionada: true,
    piezasSeleccionadas: piezas,
    tintasSeleccionadas: item.cantidad_tintas > 0 ? 1 : 0,
    posicionesSeleccionadas: item.cantidad_posiciones > 0 ? 1 : 0,
    color: '',
    detalles: item.descripcion ?? '',
    consideraciones: item.consideraciones ?? '',
    nota: '',
    precioUnitario: 0,
    precioUnitarioBase: 0,
    porcentajeDescuento: 0,
    notaDescuento: '',
    cargoExtra: 0
  };
}

export function establecerPiezasTecnica(item: TecnicaImpresionSeleccion, cantidad: number): void {
  item.piezasSeleccionadas = enteroNoNegativo(cantidad);
}

export function establecerTintasTecnica(item: TecnicaImpresionSeleccion, cantidad: number): void {
  item.tintasSeleccionadas = Math.min(enteroNoNegativo(cantidad), enteroNoNegativo(item.cantidad_tintas));
}

export function establecerPosicionesTecnica(item: TecnicaImpresionSeleccion, cantidad: number): void {
  item.posicionesSeleccionadas = Math.min(enteroNoNegativo(cantidad), enteroNoNegativo(item.cantidad_posiciones));
}

export function establecerColorTecnica(item: TecnicaImpresionSeleccion, color: string): void {
  item.color = typeof color === 'string' ? color : '';
}
