import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ClienteDetalle, ClienteService } from '../../../services/cliente.service';
import {
  CotizacionColorSeleccion,
  CotizacionLinea,
  CotizacionProducto
} from '../../../models/cotizacion-producto.model';
import {
  CotizacionProductosService,
  ProductoStockColor
} from '../../../services/cotizacion-productos.service';

interface StockColorItem extends ProductoStockColor {
  cantidadSeleccionada: number;
}

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
  lineaEditando: CotizacionLinea | null = null;
  cargandoStockProducto = false;
  calculandoPrecioProducto = false;
  stockProductoError = '';
  coloresStockProducto: StockColorItem[] = [];
  stockLocalProducto = 0;

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
    this.lineaEditando = null;
    this.productoSeleccionado = producto;
    this.modalCantidadAbierto = true;
    this.stockProductoError = '';
    this.cargandoStockProducto = true;
    this.coloresStockProducto = [];
    this.stockLocalProducto = 0;

    this.productosService.getProductoStock(producto.id).subscribe({
      next: (response) => {
        this.coloresStockProducto = response.almacenes.map((item) => ({ ...item, cantidadSeleccionada: 0 }));
        this.stockLocalProducto = response.stockLocal;
        this.cargandoStockProducto = false;
      },
      error: () => {
        this.stockProductoError = 'No se pudo cargar el stock por color del producto.';
        this.cargandoStockProducto = false;
      }
    });
  }

  abrirModalEditarCantidad(linea: CotizacionLinea): void {
    this.lineaEditando = linea;
    this.productoSeleccionado = linea;
    this.modalCantidadAbierto = true;
    this.stockProductoError = '';
    this.cargandoStockProducto = true;
    this.coloresStockProducto = [];
    this.stockLocalProducto = 0;

    this.productosService.getProductoStock(linea.id).subscribe({
      next: (response) => {
        const cantidadesActuales = new Map(
          (linea.coloresSeleccionados ?? []).map((item) => [item.color, item.cantidad])
        );

        this.coloresStockProducto = response.almacenes.map((item) => ({
          ...item,
          cantidadSeleccionada: cantidadesActuales.get(item.color) ?? 0
        }));
        this.stockLocalProducto = response.stockLocal;
        this.cargandoStockProducto = false;
      },
      error: () => {
        this.stockProductoError = 'No se pudo cargar el stock por color del producto.';
        this.cargandoStockProducto = false;
      }
    });
  }

  cerrarModalCantidad(): void {
    this.modalCantidadAbierto = false;
    this.productoSeleccionado = null;
    this.lineaEditando = null;
    this.cargandoStockProducto = false;
    this.calculandoPrecioProducto = false;
    this.stockProductoError = '';
    this.coloresStockProducto = [];
    this.stockLocalProducto = 0;
  }

  confirmarAgregarProducto(): void {
    if (!this.productoSeleccionado) {
      return;
    }

    if (this.clienteId === null) {
      this.stockProductoError = 'No se encontro el cliente para calcular el precio.';
      return;
    }

    const coloresSeleccionados = this.coloresStockProducto
      .map((item) => ({
        color: item.color,
        cantidad: Number.isFinite(item.cantidadSeleccionada) ? Math.max(0, Math.floor(item.cantidadSeleccionada)) : 0
      }))
      .filter((item) => item.cantidad > 0);

    const cantidad = coloresSeleccionados.reduce((acc, item) => acc + item.cantidad, 0);
    if (cantidad <= 0) {
      this.stockProductoError = 'Selecciona al menos una cantidad por color para agregar.';
      return;
    }

    this.calculandoPrecioProducto = true;
    this.stockProductoError = '';

    this.productosService.getProductoPrecio(this.productoSeleccionado.id, this.clienteId, cantidad).subscribe({
      next: (precioUnitario) => {
        const producto = this.productoSeleccionado;
        if (!producto) {
          this.calculandoPrecioProducto = false;
          return;
        }

        const lineaEditando = this.lineaEditando;

        if (lineaEditando) {
          this.actualizarLineaDesdeModal(lineaEditando, cantidad, coloresSeleccionados, precioUnitario);
          this.busquedaInfo = `Se actualizo ${cantidad} pza(s) de: ${producto.clave}`;
          this.calculandoPrecioProducto = false;
          this.cerrarModalCantidad();
          return;
        }

        this.agregarProducto(producto, cantidad, coloresSeleccionados, precioUnitario);
        this.busquedaInfo = `Se agrego ${cantidad} pza(s) de: ${producto.clave}`;
        this.productosEncontrados = [];
        this.terminoBusqueda = '';
        this.calculandoPrecioProducto = false;
        this.cerrarModalCantidad();
      },
      error: () => {
        this.stockProductoError = 'No se pudo calcular el precio del producto.';
        this.calculandoPrecioProducto = false;
      }
    });
  }

  actualizarCantidadColor(item: StockColorItem, cantidad: number): void {
    const maximo = item.total > 0 ? item.total : Number.MAX_SAFE_INTEGER;
    const cantidadValida = Number.isFinite(cantidad) ? Math.max(0, Math.floor(cantidad)) : 0;
    item.cantidadSeleccionada = Math.min(cantidadValida, maximo);
  }

  limpiarResultadosBusqueda(): void {
    this.productosError = '';
    this.busquedaInfo = '';
    this.productosEncontrados = [];
  }

  agregarProducto(
    producto: CotizacionProducto,
    cantidad = 1,
    coloresSeleccionados: CotizacionColorSeleccion[] = [],
    precioUnitario = producto.precioUnitario
  ): void {
    const cantidadValida = Number.isFinite(cantidad) ? Math.max(1, Math.floor(cantidad)) : 1;
    const existente = this.lineasCotizacion.find((linea) => linea.id === producto.id);
    if (existente) {
      existente.cantidad += cantidadValida;
      existente.precioUnitario = precioUnitario;
      existente.coloresSeleccionados = this.mezclarColoresSeleccionados(
        existente.coloresSeleccionados ?? [],
        coloresSeleccionados
      );
      return;
    }

    this.lineasCotizacion = [
      ...this.lineasCotizacion,
      {
        ...producto,
        precioUnitario,
        cantidad: cantidadValida,
        coloresSeleccionados
      }
    ];
  }

  actualizarCantidad(linea: CotizacionLinea, cantidad: number): void {
    const cantidadValida = Number.isFinite(cantidad) ? Math.max(1, Math.floor(cantidad)) : 1;
    linea.cantidad = cantidadValida;

    if (this.clienteId === null) {
      return;
    }

    this.productosService.getProductoPrecio(linea.id, this.clienteId, cantidadValida).subscribe({
      next: (precioUnitario) => {
        linea.precioUnitario = precioUnitario;
      }
    });
  }

  actualizarCantidadDesdeModal(linea: CotizacionLinea): void {
    this.abrirModalEditarCantidad(linea);
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

  get cantidadTotalSeleccionadaEnModal(): number {
    return this.coloresStockProducto.reduce((acc, item) => acc + item.cantidadSeleccionada, 0);
  }

  trackByProducto(_index: number, item: CotizacionProducto): number {
    return item.id;
  }

  trackByLinea(_index: number, item: CotizacionLinea): number {
    return item.id;
  }

  trackByColor(_index: number, item: StockColorItem): string {
    return item.color;
  }

  formatearColoresSeleccionados(colores: CotizacionColorSeleccion[] | undefined): string {
    if (!colores || colores.length === 0) {
      return '';
    }

    return colores.map((item) => `${item.color}: ${item.cantidad}`).join(' | ');
  }

  formatearColoresSeleccionadosCompacto(colores: CotizacionColorSeleccion[] | undefined): string {
    if (!colores || colores.length === 0) {
      return '';
    }

    const visibles = colores.slice(0, 3).map((item) => `${item.color}: ${item.cantidad}`);
    const restantes = colores.length - visibles.length;

    return restantes > 0 ? `${visibles.join(' | ')} | +${restantes} mas` : visibles.join(' | ');
  }

  getResumenColoresSeleccionados(colores: CotizacionColorSeleccion[] | undefined): string {
    if (!colores || colores.length === 0) {
      return 'Sin colores definidos';
    }

    const totalPiezas = colores.reduce((acc, item) => acc + item.cantidad, 0);
    const totalColores = colores.length;

    return `${totalColores} color(es) / ${totalPiezas} pieza(s)`;
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

  private mezclarColoresSeleccionados(
    base: CotizacionColorSeleccion[],
    incoming: CotizacionColorSeleccion[]
  ): CotizacionColorSeleccion[] {
    const merged = new Map<string, number>();

    base.forEach((item) => {
      merged.set(item.color, (merged.get(item.color) ?? 0) + item.cantidad);
    });

    incoming.forEach((item) => {
      merged.set(item.color, (merged.get(item.color) ?? 0) + item.cantidad);
    });

    return Array.from(merged.entries()).map(([color, cantidad]) => ({ color, cantidad }));
  }

  private actualizarLineaDesdeModal(
    linea: CotizacionLinea,
    cantidad: number,
    coloresSeleccionados: CotizacionColorSeleccion[],
    precioUnitario: number
  ): void {
    linea.cantidad = cantidad;
    linea.coloresSeleccionados = coloresSeleccionados;
    linea.precioUnitario = precioUnitario;
  }
}
