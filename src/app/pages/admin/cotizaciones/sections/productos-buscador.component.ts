import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CotizacionProducto } from '../../../../models/cotizacion-producto.model';

@Component({
  selector: 'app-productos-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-buscador.component.html',
  styleUrl: './productos-buscador.component.scss'
})
export class ProductosBuscadorComponent {
  @Input() termino = '';
  @Output() terminoChange = new EventEmitter<string>();
  @Input() buscando = false;
  @Input() productos: CotizacionProducto[] = [];
  @Input() error = '';
  @Input() info = '';
  @Input() clienteSeleccionado = false;

  @Output() buscar = new EventEmitter<void>();
  @Output() limpiar = new EventEmitter<void>();
  @Output() agregar = new EventEmitter<CotizacionProducto>();

  trackByProducto(_index: number, item: CotizacionProducto): number {
    return item.id;
  }
}
