import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseModalComponent } from '../../../../shared/modal/base-modal/base-modal.component';
import { TecnicaImpresionSeleccion } from '../../../../models/tecnicas-impresion.model';
import { ModoModalTecnicas, ProductoPendiente } from '../cotizacion.types';
import { obtenerOpcionesCantidad } from '../utils/cotizacion-calculos';

@Component({
  selector: 'app-tecnicas-impresion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './tecnicas-impresion-modal.component.html',
  styleUrl: './tecnicas-impresion-modal.component.scss'
})
export class TecnicasImpresionModalComponent {
  @Input() modo: ModoModalTecnicas = 'crear';
  @Input() productoPendiente: ProductoPendiente | null = null;
  @Input() catalogo: TecnicaImpresionSeleccion[] = [];
  @Input() cargando = false;
  @Input() error = '';
  @Input() calculandoPrecio = false;
  @Input() piezasAsignadas = 0;

  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();
  @Output() agregarOtra = new EventEmitter<TecnicaImpresionSeleccion>();
  @Output() eliminarInstancia = new EventEmitter<TecnicaImpresionSeleccion>();
  @Output() alternar = new EventEmitter<{ tecnica: TecnicaImpresionSeleccion; seleccionada: boolean }>();
  @Output() piezasChange = new EventEmitter<{ tecnica: TecnicaImpresionSeleccion; valor: number }>();
  @Output() tintasChange = new EventEmitter<{ tecnica: TecnicaImpresionSeleccion; valor: number }>();
  @Output() posicionesChange = new EventEmitter<{ tecnica: TecnicaImpresionSeleccion; valor: number }>();
  @Output() colorChange = new EventEmitter<{ tecnica: TecnicaImpresionSeleccion; valor: string }>();

  readonly obtenerOpcionesCantidad = obtenerOpcionesCantidad;

  trackByTecnica(index: number, item: TecnicaImpresionSeleccion): number {
    return item.instanciaId ?? index;
  }

  cantidadInstancias(idTecnica: number): number {
    return this.catalogo.filter((item) => item.id_tecnica === idTecnica).length;
  }

  numeroInstancia(item: TecnicaImpresionSeleccion): number {
    return this.catalogo
      .slice(0, this.catalogo.indexOf(item) + 1)
      .filter((tecnica) => tecnica.id_tecnica === item.id_tecnica).length;
  }

  get titulo(): string {
    switch (this.modo) {
      case 'editar-linea':
        return 'Editar tecnicas de impresion';
      case 'agregar-linea':
        return 'Agregar tecnicas de impresion';
      default:
        return 'Tecnicas de impresion del producto';
    }
  }

  get textoConfirmar(): string {
    if (this.calculandoPrecio) {
      return 'Calculando precio...';
    }
    switch (this.modo) {
      case 'editar-linea':
        return 'Guardar cambios';
      case 'agregar-linea':
        return 'Agregar tecnicas';
      default:
        return 'Agregar a cotizacion';
    }
  }
}
