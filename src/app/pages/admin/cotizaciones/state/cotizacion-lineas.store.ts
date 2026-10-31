import { Injectable } from '@angular/core';
import { CotizacionLinea } from '../../../../models/cotizacion-producto.model';
import { calcularTotales, obtenerIdsAlmacen, TotalesCotizacion } from '../utils/cotizacion-calculos';

/**
 * Estado de las lineas de la cotizacion en edicion.
 * Se provee a nivel de componente (providers) para que cada pantalla tenga su propia instancia.
 */
@Injectable()
export class CotizacionLineasStore {
  lineas: CotizacionLinea[] = [];

  get idsAlmacen(): number[] {
    return obtenerIdsAlmacen(this.lineas);
  }

  get totales(): TotalesCotizacion {
    return calcularTotales(this.lineas);
  }

  buscar(idProducto: number): CotizacionLinea | undefined {
    return this.lineas.find((linea) => linea.id === idProducto);
  }

  agregar(linea: CotizacionLinea): void {
    this.lineas = [...this.lineas, linea];
  }

  eliminar(idProducto: number): void {
    this.lineas = this.lineas.filter((linea) => linea.id !== idProducto);
  }

  limpiar(): void {
    this.lineas = [];
  }
}
