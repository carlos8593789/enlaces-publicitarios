import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CotizacionLinea } from '../../../../models/cotizacion-producto.model';
import { TecnicaImpresionSeleccion } from '../../../../models/tecnicas-impresion.model';
import { getImporteLinea, getTotalTecnica } from '../utils/cotizacion-calculos';
import {
  formatearColoresSeleccionados,
  formatearColoresSeleccionadosCompacto,
  getResumenColoresSeleccionados
} from '../utils/cotizacion-formato';

@Component({
  selector: 'app-lineas-tabla',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lineas-tabla.component.html',
  styleUrl: './lineas-tabla.component.scss'
})
export class LineasTablaComponent {
  @Input() lineas: CotizacionLinea[] = [];

  @Output() agregarTecnicas = new EventEmitter<CotizacionLinea>();
  @Output() editarProducto = new EventEmitter<CotizacionLinea>();
  @Output() eliminarProducto = new EventEmitter<number>();
  @Output() quitarDescuentoProducto = new EventEmitter<CotizacionLinea>();
  @Output() editarTecnicas = new EventEmitter<CotizacionLinea>();
  @Output() eliminarTecnica = new EventEmitter<{ linea: CotizacionLinea; tecnica: TecnicaImpresionSeleccion }>();
  @Output() quitarDescuentoTecnica = new EventEmitter<TecnicaImpresionSeleccion>();

  readonly getImporteLinea = getImporteLinea;
  readonly getTotalTecnica = getTotalTecnica;
  readonly formatearColoresSeleccionados = formatearColoresSeleccionados;
  readonly formatearColoresSeleccionadosCompacto = formatearColoresSeleccionadosCompacto;
  readonly getResumenColoresSeleccionados = getResumenColoresSeleccionados;

  trackByLinea(_index: number, item: CotizacionLinea): number {
    return item.id;
  }

  trackByTecnica(index: number, item: TecnicaImpresionSeleccion): number {
    return item.instanciaId ?? index;
  }
}
