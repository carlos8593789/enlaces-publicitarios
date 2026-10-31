import { CotizacionColorSeleccion } from '../../../../models/cotizacion-producto.model';
import { TecnicaImpresionSeleccion } from '../../../../models/tecnicas-impresion.model';

export function formatearColoresSeleccionados(colores: CotizacionColorSeleccion[] | undefined): string {
  if (!colores || colores.length === 0) {
    return '';
  }

  return colores.map((item) => `${item.color}: ${item.cantidad}`).join(' | ');
}

export function formatearColoresSeleccionadosCompacto(colores: CotizacionColorSeleccion[] | undefined): string {
  if (!colores || colores.length === 0) {
    return '';
  }

  const visibles = colores.slice(0, 3).map((item) => `${item.color}: ${item.cantidad}`);
  const restantes = colores.length - visibles.length;

  return restantes > 0 ? `${visibles.join(' | ')} | +${restantes} mas` : visibles.join(' | ');
}

export function getResumenColoresSeleccionados(colores: CotizacionColorSeleccion[] | undefined): string {
  if (!colores || colores.length === 0) {
    return 'Sin colores definidos';
  }

  const totalPiezas = colores.reduce((acc, item) => acc + item.cantidad, 0);
  return `${colores.length} color(es) / ${totalPiezas} pieza(s)`;
}

export function formatearTecnicasImpresion(tecnicas: TecnicaImpresionSeleccion[] | undefined): string {
  if (!tecnicas || tecnicas.length === 0) {
    return '';
  }

  return tecnicas
    .map((item) => {
      const resumen = [item.nombre];
      if (item.piezasSeleccionadas > 0) {
        resumen.push(`${item.piezasSeleccionadas} pieza(s)`);
      }
      if (item.tintasSeleccionadas > 0) {
        resumen.push(`${item.tintasSeleccionadas} tinta(s)`);
      }
      if (item.posicionesSeleccionadas > 0) {
        resumen.push(`${item.posicionesSeleccionadas} posicion(es)`);
      }

      return resumen.join(' / ');
    })
    .join(' | ');
}

export function formatearResumenTecnicasImpresion(tecnicas: TecnicaImpresionSeleccion[]): string {
  if (!tecnicas || tecnicas.length === 0) {
    return '';
  }

  const resumen = tecnicas.map((item) => {
    const partes = [item.nombre];
    if (item.tintasSeleccionadas > 0) {
      partes.push(`${item.tintasSeleccionadas} tinta(s)`);
    }
    if (item.posicionesSeleccionadas > 0) {
      partes.push(`${item.posicionesSeleccionadas} posicion(es)`);
    }
    if ((item.color || '').trim()) {
      partes.push(`color: ${item.color.trim()}`);
    }
    return partes.join(' / ');
  });

  return ` con tecnica(s): ${resumen.join(' | ')}`;
}
