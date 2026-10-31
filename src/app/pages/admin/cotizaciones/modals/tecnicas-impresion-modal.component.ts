import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseModalComponent } from '../../../../shared/modal/base-modal/base-modal.component';
import type { CrearCotizacionComponent } from '../crear-cotizacion.component';

@Component({
  selector: 'app-tecnicas-impresion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './tecnicas-impresion-modal.component.html',
  styleUrl: './tecnicas-impresion-modal.component.scss'
})
export class TecnicasImpresionModalComponent {
  /** Pantalla padre que mantiene el estado y la logica de las tecnicas. */
  @Input({ required: true }) ctx!: CrearCotizacionComponent;

  get titulo(): string {
    switch (this.ctx.modoModalTecnicas) {
      case 'editar-linea':
        return 'Editar tecnicas de impresion';
      case 'agregar-linea':
        return 'Agregar tecnicas de impresion';
      default:
        return 'Tecnicas de impresion del producto';
    }
  }

  get textoConfirmar(): string {
    if (this.ctx.calculandoPrecioTecnicas) {
      return 'Calculando precio...';
    }
    switch (this.ctx.modoModalTecnicas) {
      case 'editar-linea':
        return 'Guardar cambios';
      case 'agregar-linea':
        return 'Agregar tecnicas';
      default:
        return 'Agregar a cotizacion';
    }
  }
}
