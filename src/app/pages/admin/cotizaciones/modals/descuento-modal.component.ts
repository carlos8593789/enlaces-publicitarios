import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseModalComponent } from '../../../../shared/modal/base-modal/base-modal.component';

export type DescuentoAlcance = 'productos' | 'tecnicas' | 'todo';

@Component({
  selector: 'app-descuento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './descuento-modal.component.html'
})
export class DescuentoModalComponent {
  @Input() alcance: DescuentoAlcance = 'todo';
  @Input() porcentaje = 0;
  @Input() nota = '';
  @Input() error = '';

  @Output() alcanceChange = new EventEmitter<DescuentoAlcance>();
  @Output() porcentajeChange = new EventEmitter<number>();
  @Output() notaChange = new EventEmitter<string>();
  @Output() cerrar = new EventEmitter<void>();
  @Output() aplicar = new EventEmitter<void>();
}
