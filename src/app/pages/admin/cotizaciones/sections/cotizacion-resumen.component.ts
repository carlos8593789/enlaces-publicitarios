import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cotizacion-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cotizacion-resumen.component.html',
  styleUrl: './cotizacion-resumen.component.scss'
})
export class CotizacionResumenComponent {
  @Input() subtotalProducto = 0;
  @Input() subtotalTecnicas = 0;
  @Input() montoReglaNegocio = 0;
  @Input() subtotal = 0;
  @Input() iva = 0;
  @Input() total = 0;
  @Input() cantidadTotalProductos = 0;
  @Input() ivaRate = 0;
  @Input() sinLineas = true;
  @Input() sinCliente = true;
  @Input() creando = false;
  @Input() cargando = false;
  @Input() esEdicion = false;
  @Input() esCopia = false;
  @Input() hayCambios = false;
  @Input() error = '';
  @Input() exito = '';
  @Input() urlModulo = '';
  @Input() idCotizacionCreada: number | null = null;
  @Input() urlDetalleCreada = '';

  @Output() crear = new EventEmitter<void>();

  get textoBoton(): string {
    if (this.creando) {
      return this.esEdicion ? 'Guardando cambios...' : 'Creando cotizacion...';
    }
    if (this.esEdicion) {
      return this.hayCambios ? 'Guardar cambios' : 'Sin cambios';
    }
    return 'Crear cotización';
  }

  get deshabilitado(): boolean {
    return (
      this.creando ||
      this.cargando ||
      this.sinLineas ||
      this.sinCliente ||
      (this.esEdicion && !this.hayCambios)
    );
  }
}
