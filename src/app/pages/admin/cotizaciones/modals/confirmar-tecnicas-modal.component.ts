import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseModalComponent } from '../../../../shared/modal/base-modal/base-modal.component';

@Component({
  selector: 'app-confirmar-tecnicas-modal',
  standalone: true,
  imports: [BaseModalComponent],
  templateUrl: './confirmar-tecnicas-modal.component.html'
})
export class ConfirmarTecnicasModalComponent {
  @Input() cargando = false;

  @Output() continuarSinTecnicas = new EventEmitter<void>();
  @Output() agregarTecnicas = new EventEmitter<void>();
}
