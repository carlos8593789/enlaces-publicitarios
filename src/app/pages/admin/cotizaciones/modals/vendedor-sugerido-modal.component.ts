import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModalComponent } from '../../../../shared/modal/base-modal/base-modal.component';
import { VendedorSugeridoItem } from '../../../../services/cliente.service';

@Component({
  selector: 'app-vendedor-sugerido-modal',
  standalone: true,
  imports: [CommonModule, BaseModalComponent],
  templateUrl: './vendedor-sugerido-modal.component.html'
})
export class VendedorSugeridoModalComponent {
  @Input() vendedor: VendedorSugeridoItem | null = null;
  @Input() enviando = false;
  @Input() exito = '';
  @Input() error = '';
  @Input() puedeEnviar = true;

  @Output() cerrar = new EventEmitter<void>();
  @Output() enviarCorreo = new EventEmitter<void>();
}
