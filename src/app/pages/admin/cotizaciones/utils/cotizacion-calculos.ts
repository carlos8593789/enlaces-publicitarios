import { CotizacionColorSeleccion, CotizacionLinea } from '../../../../models/cotizacion-producto.model';
import { TecnicaImpresionSeleccion } from '../../../../models/tecnicas-impresion.model';

export const IVA_RATE = 0.16;

export interface TotalesCotizacion {
  subtotalProducto: number;
  subtotalTecnicas: number;
  montoReglaNegocio: number;
  subtotal: number;
  iva: number;
  total: number;
  cantidadProductos: number;
}

export function redondearMoneda(valor: number): number {
  return Math.round((Math.max(0, Number(valor) || 0) + Number.EPSILON) * 100) / 100;
}

export function obtenerPrecioBase(precioBase: number | undefined, precioActual: number): number {
  const base = Number(precioBase);
  return Number.isFinite(base) && base >= 0 ? base : Math.max(0, Number(precioActual) || 0);
}

export function calcularPrecioConDescuento(precioBase: number, porcentaje: number): number {
  const descuento = Math.min(100, Math.max(0, Number(porcentaje) || 0));
  return redondearMoneda(Math.max(0, precioBase * (1 - descuento / 100)));
}

export function aplicarDescuentoProducto(linea: CotizacionLinea, porcentaje: number, nota: string): void {
  const precioBase = obtenerPrecioBase(linea.precioUnitarioBase, linea.precioUnitario);
  linea.precioUnitarioBase = precioBase;
  linea.porcentajeDescuento = porcentaje;
  linea.notaDescuento = nota;
  linea.precioUnitario = calcularPrecioConDescuento(precioBase, porcentaje);
}

export function aplicarDescuentoTecnica(tecnica: TecnicaImpresionSeleccion, porcentaje: number, nota: string): void {
  const precioBase = obtenerPrecioBase(tecnica.precioUnitarioBase, tecnica.precioUnitario ?? 0);
  tecnica.precioUnitarioBase = precioBase;
  tecnica.porcentajeDescuento = porcentaje;
  tecnica.notaDescuento = nota;
  tecnica.precioUnitario = calcularPrecioConDescuento(precioBase, porcentaje);
}

export function getTotalTecnica(tecnica: TecnicaImpresionSeleccion): number {
  const precioUnitario = Math.max(0, Number(tecnica.precioUnitario ?? 0));
  const piezas = Math.max(0, Number(tecnica.piezasSeleccionadas ?? 0));
  const cargoExtra = Math.max(0, Number(tecnica.cargoExtra ?? 0));

  return redondearMoneda(redondearMoneda(precioUnitario) * piezas + cargoExtra);
}

export function getTotalTecnicasPorLinea(linea: CotizacionLinea): number {
  return (linea.tecnicasImpresion ?? []).reduce((acc, tecnica) => acc + getTotalTecnica(tecnica), 0);
}

export function getImporteLinea(linea: CotizacionLinea): number {
  return redondearMoneda(linea.precioUnitario) * linea.cantidad;
}

export function calcularTotales(lineas: CotizacionLinea[], ivaRate = IVA_RATE): TotalesCotizacion {
  const subtotalProducto = lineas.reduce((acc, linea) => acc + getImporteLinea(linea), 0);
  const subtotalTecnicas = lineas.reduce((acc, linea) => acc + getTotalTecnicasPorLinea(linea), 0);
  const montoReglaNegocio = lineas.reduce((acc, linea) => acc + linea.montoReglaNegocio, 0);
  const subtotal = subtotalProducto + subtotalTecnicas + montoReglaNegocio;
  const iva = subtotal * ivaRate;

  return {
    subtotalProducto,
    subtotalTecnicas,
    montoReglaNegocio,
    subtotal,
    iva,
    total: subtotal + iva,
    cantidadProductos: lineas.reduce((acc, linea) => acc + linea.cantidad, 0)
  };
}

export function obtenerOpcionesCantidad(maximo: number, minimo = 0): number[] {
  const maximoNormalizado = Math.max(0, Math.floor(Number(maximo) || 0));
  const minimoNormalizado = Math.max(0, Math.floor(Number(minimo) || 0));

  if (maximoNormalizado < minimoNormalizado) {
    return [];
  }

  return Array.from({ length: maximoNormalizado - minimoNormalizado + 1 }, (_valor, index) => minimoNormalizado + index);
}

export function totalPiezasTecnicas(tecnicas: TecnicaImpresionSeleccion[] | undefined): number {
  if (!tecnicas || tecnicas.length === 0) {
    return 0;
  }

  return tecnicas.reduce((acc, item) => acc + Math.max(0, Math.floor(Number(item.piezasSeleccionadas) || 0)), 0);
}

export function mezclarColoresSeleccionados(
  base: CotizacionColorSeleccion[],
  incoming: CotizacionColorSeleccion[]
): CotizacionColorSeleccion[] {
  const merged = new Map<string, number>();

  [...base, ...incoming].forEach((item) => {
    merged.set(item.color, (merged.get(item.color) ?? 0) + item.cantidad);
  });

  return Array.from(merged.entries()).map(([color, cantidad]) => ({ color, cantidad }));
}

export function obtenerIdsAlmacen(lineas: CotizacionLinea[]): number[] {
  return Array.from(
    new Set(lineas.map((linea) => Number(linea.id_almacen)).filter((id) => Number.isFinite(id) && id > 0))
  );
}
