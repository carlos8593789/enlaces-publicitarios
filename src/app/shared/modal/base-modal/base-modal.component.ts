import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalSize = 'sm' | 'md' | 'lg';

let nextModalId = 0;

/**
 * Modal base con el diseño unico de la aplicacion.
 *
 * Slots:
 *  - (default): cuerpo
 *  - [modal-subtitle]: texto bajo el titulo
 *  - [modal-footer]: acciones (botones)
 *
 * Se renderiza siempre abierto: el consumidor lo monta/desmonta con *ngIf.
 */
@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-modal.component.html',
  styleUrl: './base-modal.component.scss'
})
export class BaseModalComponent {
  @Input() title = '';
  @Input() size: ModalSize = 'md';
  @Input() showClose = true;
  @Input() closeOnBackdrop = true;

  @Output() closed = new EventEmitter<void>();

  readonly titleId = `app-modal-title-${nextModalId++}`;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.requestClose();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.requestClose();
    }
  }

  requestClose(): void {
    this.closed.emit();
  }
}
