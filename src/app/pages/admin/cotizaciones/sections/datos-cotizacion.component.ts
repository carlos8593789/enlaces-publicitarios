import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CondicionVentaItem } from '../../../../services/condiciones-venta.service';

@Component({
  selector: 'app-datos-cotizacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './datos-cotizacion.component.html',
  styleUrl: './datos-cotizacion.component.scss'
})
export class DatosCotizacionComponent {
  @Input() riesgos = '';
  @Output() riesgosChange = new EventEmitter<string>();
  @Input() condicionesVenta = '';
  @Output() condicionesVentaChange = new EventEmitter<string>();
  @Input() idCondicionSeleccionada = '';
  @Output() idCondicionSeleccionadaChange = new EventEmitter<string>();
  @Input() permitirPago = true;
  @Output() permitirPagoChange = new EventEmitter<boolean>();

  @Input() catalogo: CondicionVentaItem[] = [];
  @Input() cargandoCondiciones = false;
  @Input() condicionesError = '';

  @Output() condicionSeleccionada = new EventEmitter<string>();

  seleccionarCondicion(id: string): void {
    this.idCondicionSeleccionadaChange.emit(id);
    this.condicionSeleccionada.emit(id);
  }
}
