import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseModalComponent } from '../../../../shared/modal/base-modal/base-modal.component';
import type { CrearCotizacionComponent } from '../crear-cotizacion.component';

@Component({
  selector: 'app-cantidad-producto-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './cantidad-producto-modal.component.html',
  styleUrl: './cantidad-producto-modal.component.scss'
})
export class CantidadProductoModalComponent {
  /** Pantalla padre que mantiene el estado y la logica de la cantidad por color. */
  @Input({ required: true }) ctx!: CrearCotizacionComponent;
}
