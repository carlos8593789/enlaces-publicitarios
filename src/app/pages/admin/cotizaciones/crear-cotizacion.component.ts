import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ClienteDetalle, ClienteService } from '../../../services/cliente.service';
import { CotizacionLinea, CotizacionProducto } from '../../../models/cotizacion-producto.model';
import { CotizacionProductosService } from '../../../services/cotizacion-productos.service';

@Component({
  selector: 'app-crear-cotizacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-cotizacion.component.html',
  styleUrl: './crear-cotizacion.component.scss'
})
export class CrearCotizacionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clienteService = inject(ClienteService);
  private readonly productosService = inject(CotizacionProductosService);

  readonly ivaRate = 0.16;

  clienteId: number | null = null;
  cliente: ClienteDetalle | null = null;
  isLoadingCliente = false;
  clienteError = '';

  terminoBusqueda = '';
  buscandoProductos = false;
  productosError = '';
  busquedaInfo = '';
  productosEncontrados: CotizacionProducto[] = [];
  modalCantidadAbierto = false;
  productoSeleccionado: CotizacionProducto | null = null;
  cantidadSeleccionada = 1;

  lineasCotizacion: CotizacionLinea[] = [];

  ngOnInit(): void {
    this.loadClienteFromQueryParam();
  }

  get clienteTelefono(): string {
    if (!this.cliente) {
      return 'Sin telefono';
    }

    const telefono =
      this.cliente.telefono ||
      this.cliente.celular ||
      this.cliente.telefono_contacto ||
      '';

    return telefono || 'Sin telefono';
  }

  private cargarCliente(idCliente: number): void {
    this.isLoadingCliente = true;
    this.clienteError = '';

    this.clienteService.getClienteById(idCliente).subscribe({
      next: (response) => {
        this.cliente = response.data;
        this.isLoadingCliente = false;
      },
      error: () => {
        this.clienteError = 'No fue posible cargar la informacion del cliente.';
        this.cliente = null;
        this.isLoadingCliente = false;
      }
    });
  }

  buscarProductos(): void {
    const term = this.terminoBusqueda.trim();
    if (!term) {
      this.productosError = 'Escribe un producto para buscar.';
      this.busquedaInfo = '';
      this.productosEncontrados = [];
      return;
    }

    this.buscandoProductos = true;
    this.productosError = '';
    this.busquedaInfo = '';
    this.productosEncontrados = [];

    this.productosService.searchProductos(term).subscribe({
      next: (productos) => {
        if (productos.length === 0) {
          this.productosError = 'No se encontraron productos con ese criterio.';
          this.buscandoProductos = false;
          return;
        }

        this.productosEncontrados = productos;
        this.busquedaInfo = `${productos.length} producto(s) encontrado(s).`;
        this.buscandoProductos = false;
      },
      error: () => {
        this.productosError = 'No se pudieron cargar productos.';
        this.productosEncontrados = [];
        this.buscandoProductos = false;
      }
    });
  }

  abrirModalCantidad(producto: CotizacionProducto): void {
    this.productoSeleccionado = producto;
    this.cantidadSeleccionada = 1;
    this.modalCantidadAbierto = true;
  }

  cerrarModalCantidad(): void {
    this.modalCantidadAbierto = false;
    this.productoSeleccionado = null;
    this.cantidadSeleccionada = 1;
  }

  confirmarAgregarProducto(): void {
    if (!this.productoSeleccionado) {
      return;
    }

    const cantidad = Number.isFinite(this.cantidadSeleccionada)
      ? Math.max(1, Math.floor(this.cantidadSeleccionada))
      : 1;

    this.agregarProducto(this.productoSeleccionado, cantidad);
    this.busquedaInfo = `Se agrego ${cantidad} pza(s) de: ${this.productoSeleccionado.clave}`;
    this.productosEncontrados = [];
    this.terminoBusqueda = '';
    this.cerrarModalCantidad();
  }

  limpiarResultadosBusqueda(): void {
    this.productosError = '';
    this.busquedaInfo = '';
    this.productosEncontrados = [];
  }

  agregarProducto(producto: CotizacionProducto, cantidad = 1): void {
    const cantidadValida = Number.isFinite(cantidad) ? Math.max(1, Math.floor(cantidad)) : 1;
    const existente = this.lineasCotizacion.find((linea) => linea.id === producto.id);
    if (existente) {
      existente.cantidad += cantidadValida;
      return;
    }

    this.lineasCotizacion = [
      ...this.lineasCotizacion,
      {
        ...producto,
        cantidad: cantidadValida
      }
    ];
  }

  actualizarCantidad(linea: CotizacionLinea, cantidad: number): void {
    const cantidadValida = Number.isFinite(cantidad) ? Math.max(1, Math.floor(cantidad)) : 1;
    linea.cantidad = cantidadValida;
  }

  eliminarProducto(idProducto: number): void {
    this.lineasCotizacion = this.lineasCotizacion.filter((linea) => linea.id !== idProducto);
  }

  limpiarCotizacion(): void {
    this.lineasCotizacion = [];
  }

  get subtotal(): number {
    return this.lineasCotizacion.reduce((acc, linea) => acc + linea.precioUnitario * linea.cantidad, 0);
  }

  get iva(): number {
    return this.subtotal * this.ivaRate;
  }

  get total(): number {
    return this.subtotal + this.iva;
  }

  get cantidadTotalProductos(): number {
    return this.lineasCotizacion.reduce((acc, linea) => acc + linea.cantidad, 0);
  }

  trackByProducto(_index: number, item: CotizacionProducto): number {
    return item.id;
  }

  trackByLinea(_index: number, item: CotizacionLinea): number {
    return item.id;
  }

  private loadClienteFromQueryParam(): void {
    const rawId = this.route.snapshot.queryParamMap.get('idCliente');
    if (!rawId) {
      this.clienteError = 'No se recibio el idCliente en la URL. En esta pantalla no se puede cambiar el cliente.';
      this.cliente = null;
      return;
    }

    const idCliente = Number(rawId);
    if (!Number.isFinite(idCliente) || idCliente <= 0) {
      this.clienteError = 'El idCliente de la URL es invalido.';
      this.cliente = null;
      return;
    }

    this.clienteId = idCliente;
    this.cargarCliente(idCliente);
  }
}
