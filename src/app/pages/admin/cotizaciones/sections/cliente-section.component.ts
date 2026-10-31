import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ClienteBusquedaItem,
  ClienteDetalle,
  VendedorSugeridoItem
} from '../../../../services/cliente.service';

@Component({
  selector: 'app-cliente-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-section.component.html',
  styleUrl: './cliente-section.component.scss'
})
export class ClienteSectionComponent {
  @Input() mostrarBuscador = false;
  @Input() termino = '';
  @Output() terminoChange = new EventEmitter<string>();
  @Input() buscando = false;
  @Input() clientes: ClienteBusquedaItem[] = [];
  @Input() busquedaError = '';
  @Input() busquedaInfo = '';
  @Input() consultandoVendedor = false;
  @Input() vendedorError = '';

  @Input() cargando = false;
  @Input() error = '';
  @Input() cliente: ClienteDetalle | null = null;
  @Input() clienteId: number | null = null;
  @Input() telefono = '';
  @Input() vendedorSugerido: VendedorSugeridoItem | null = null;

  @Output() buscar = new EventEmitter<void>();
  @Output() limpiar = new EventEmitter<void>();
  @Output() seleccionar = new EventEmitter<ClienteBusquedaItem>();
}
