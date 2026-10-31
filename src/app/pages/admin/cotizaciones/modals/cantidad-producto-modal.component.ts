import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseModalComponent } from '../../../../shared/modal/base-modal/base-modal.component';
import { CotizacionProducto } from '../../../../models/cotizacion-producto.model';
import { StockColorItem } from '../cotizacion.types';

@Component({
  selector: 'app-cantidad-producto-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './cantidad-producto-modal.component.html',
  styleUrl: './cantidad-producto-modal.component.scss'
})
export class CantidadProductoModalComponent {
  @Input() editando = false;
  @Input() producto: CotizacionProducto | null = null;
  @Input() stockLocal = 0;
  @Input() descripcion = '';
  @Output() descripcionChange = new EventEmitter<string>();
  @Input() cargandoStock = false;
  @Input() error = '';
  @Input() colores: StockColorItem[] = [];
  @Input() totalSeleccionado = 0;
  @Input() calculandoPrecio = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();
  @Output() cantidadColorChange = new EventEmitter<{ item: StockColorItem; cantidad: number }>();

  trackByColor(_index: number, item: StockColorItem): string {
    return item.color;
  }
}
