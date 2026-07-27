import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ClienteBusquedaItem, ClienteDetalle, ClienteService } from '../../../services/cliente.service';
import { environment } from '../../../../environments/environment';
import {
  CotizacionColorSeleccion,
  CotizacionLinea,
  CotizacionProducto
} from '../../../models/cotizacion-producto.model';
import {
  CotizacionProductosService,
  ProductoBusquedaResponse,
  ProductoPrecioResponse,
  ProductoStockResponse,
  ProductoStockColor
} from '../../../services/cotizacion-productos.service';
import {
  CondicionVentaItem,
  CondicionesVentaService
} from '../../../services/condiciones-venta.service';
import { CotizacionesService, CrearCotizacionPayload, CrearCotizacionResponse } from '../../../services/cotizaciones.service';

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
  private readonly condicionesVentaService = inject(CondicionesVentaService);
  private readonly productosService = inject(CotizacionProductosService);
  private readonly cotizacionesService = inject(CotizacionesService);

  readonly ivaRate = 0.16;

  clienteId: number | null = null;
  cliente: ClienteDetalle | null = null;
  isLoadingCliente = false;
  clienteError = '';
  terminoBusquedaCliente = '';
  buscandoClientes = false;
  clientesEncontrados: ClienteBusquedaItem[] = [];
  clienteBusquedaError = '';
  clienteBusquedaInfo = '';

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

  permitirPago = true;
  riesgos = '';
  condicionesVenta = '';
  condicionesVentaCatalogo: CondicionVentaItem[] = [];
  idCondicionVentaSeleccionada = '';
  cargandoCondicionesVenta = false;
  condicionesVentaError = '';
  creandoCotizacion = false;
  crearCotizacionError = '';
  crearCotizacionExito = '';

  ngOnInit(): void {
    this.cargarCondicionesVenta();
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

  seleccionarCondicionVenta(idCondicion: string): void {
    this.idCondicionVentaSeleccionada = idCondicion;

    const condicionId = Number(idCondicion);
    if (!Number.isFinite(condicionId)) {
      this.condicionesVenta = '';
      return;
    }

    const condicion = this.condicionesVentaCatalogo.find((item) => item.id === condicionId);
    this.condicionesVenta = condicion?.comentarios ?? '';
  }

  buscarClientes(): void {
    const term = this.terminoBusquedaCliente.trim();
    if (!term) {
      this.clienteBusquedaError = 'Escribe al menos un dato para buscar el cliente.';
      this.clienteBusquedaInfo = '';
      this.clientesEncontrados = [];
      return;
    }

    this.buscandoClientes = true;
    this.clienteBusquedaError = '';
    this.clienteBusquedaInfo = '';
    this.clientesEncontrados = [];

    this.clienteService.searchClientes(term).subscribe({
      next: (clientes) => {
        if (clientes.length === 0) {
          this.clienteBusquedaError = 'No se encontraron clientes con ese criterio.';
          this.buscandoClientes = false;
          return;
        }

        this.clientesEncontrados = clientes;
        this.clienteBusquedaInfo = `${clientes.length} cliente(s) encontrado(s).`;
        this.buscandoClientes = false;
      },
      error: () => {
        this.clienteBusquedaError = 'No se pudieron buscar clientes.';
        this.buscandoClientes = false;
      }
    });
  }

  private cargarCondicionesVenta(): void {
    this.cargandoCondicionesVenta = true;
    this.condicionesVentaError = '';

    this.condicionesVentaService.getCondicionesVenta().subscribe({
      next: (condiciones) => {
        this.condicionesVentaCatalogo = condiciones;
        this.cargandoCondicionesVenta = false;
      },
      error: () => {
        this.condicionesVentaCatalogo = [];
        this.condicionesVentaError = 'No fue posible cargar las condiciones de venta.';
        this.cargandoCondicionesVenta = false;
      }
    });
  }

  seleccionarCliente(cliente: ClienteBusquedaItem): void {
    this.clienteId = cliente.id;
    this.cliente = {
      id: cliente.id,
      nombre: cliente.value,
      email: cliente.email,
      empresa: '',
      telefono: cliente.telefono,
      celular: '',
      telefono_contacto: cliente.telefono
    };
    this.clienteError = '';
    this.clienteBusquedaError = '';
    this.clienteBusquedaInfo = `Cliente seleccionado: ${cliente.label}`;
    this.terminoBusquedaCliente = cliente.label;
    this.clientesEncontrados = [];
  }

  limpiarBusquedaCliente(): void {
    this.clienteBusquedaError = '';
    this.clienteBusquedaInfo = '';
    this.clientesEncontrados = [];
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
      next: (response: ProductoBusquedaResponse) => {
        const productos = this.normalizarProductosBusqueda(response);
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
      next: (response: ProductoStockResponse) => {
        const stockNormalizado = this.normalizarStockProducto(response);
        this.coloresStockProducto = stockNormalizado.almacenes.map((item) => ({ ...item, cantidadSeleccionada: 0 }));
        this.stockLocalProducto = stockNormalizado.stockLocal;
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
      next: (response: ProductoStockResponse) => {
        const stockNormalizado = this.normalizarStockProducto(response);
        const cantidadesActuales = new Map(
          (linea.coloresSeleccionados ?? []).map((item) => [item.color, item.cantidad])
        );

        this.coloresStockProducto = stockNormalizado.almacenes.map((item) => ({
          ...item,
          cantidadSeleccionada: cantidadesActuales.get(item.color) ?? 0
        }));
        this.stockLocalProducto = stockNormalizado.stockLocal;
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
      next: (response: ProductoPrecioResponse) => {
        const precioUnitario = this.normalizarPrecioProducto(response);
        const producto = this.productoSeleccionado;
        if (!producto) {
          this.calculandoPrecioProducto = false;
          return;
        }

        const lineaEditando = this.lineaEditando;

        if (lineaEditando) {
          this.actualizarLineaDesdeModal(lineaEditando, cantidad, coloresSeleccionados, precioUnitario);
          this.busquedaInfo = `Se actualizo ${cantidad} pza(s) de: ${producto.value}`;
          this.calculandoPrecioProducto = false;
          this.cerrarModalCantidad();
          return;
        }

        this.agregarProducto(producto, cantidad, coloresSeleccionados, precioUnitario);
        this.busquedaInfo = `Se agrego ${cantidad} pza(s) de: ${producto.value}`;
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
    precioUnitario = 0
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
      next: (response: ProductoPrecioResponse) => {
        const precioUnitario = this.normalizarPrecioProducto(response);
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

  crearCotizacion(): void {
    this.crearCotizacionError = '';
    this.crearCotizacionExito = '';

    if (this.clienteId === null) {
      this.crearCotizacionError = 'No se encontro un cliente valido para crear la cotizacion.';
      return;
    }

    if (this.lineasCotizacion.length === 0) {
      this.crearCotizacionError = 'Agrega al menos un producto antes de crear la cotizacion.';
      return;
    }

    const payload: CrearCotizacionPayload = {
      id_cliente: this.clienteId,
      observaciones: '',
      permitir_pago: this.permitirPago,
      riesgos: this.riesgos.trim(),
      condiciones_venta: this.condicionesVenta.trim(),
      id_vendedor_sugerido: this.clienteId,
      productos: this.lineasCotizacion.map((linea) => ({
        id_producto: linea.id,
        producto_color_cantidad: this.formatearProductoColorCantidad(linea.coloresSeleccionados),
        descripcion: linea.label,
        porcentaje_descuento: 0,
        cantidad: linea.cantidad
      }))
    };

    this.creandoCotizacion = true;

    this.cotizacionesService.createCotizacion(payload).subscribe({
      next: (response: CrearCotizacionResponse) => {
        this.crearCotizacionExito = `${response.message} #${response.data.id_cotizacion}`;
        this.lineasCotizacion = [];
        this.creandoCotizacion = false;
      },
      error: () => {
        this.crearCotizacionError = 'No se pudo crear la cotizacion. Intenta nuevamente.';
        this.creandoCotizacion = false;
      }
    });
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

  private normalizarProductosBusqueda(response: ProductoBusquedaResponse): CotizacionProducto[] {
    const items = Array.isArray(response.data) ? response.data : [];

    const parsed = items
      .filter((item): item is NonNullable<typeof item> => !!item && typeof item === 'object' && !Array.isArray(item))
      .map((item) => ({
        id: Number(item.id ?? 0),
        value: typeof item.value === 'string' ? item.value.trim() : '',
        label: typeof item.label === 'string' ? item.label.trim() : '',
        imagen: typeof item.imagen === 'string' ? item.imagen : '',
        id_almacen: Number(item.id_almacen ?? 0)
      }))
      .filter((item) => Number.isFinite(item.id) && item.value && item.label)
      .map((item) => ({
        id: item.id,
        value: item.value,
        label: item.label,
        imagen: this.normalizarImagenProducto(item.imagen),
        id_almacen: Number.isFinite(item.id_almacen) ? item.id_almacen : 0
      }));

    const productos = Array.from(new Map(parsed.map((item) => [item.id, item] as const)).values());
    const normalizedTerm = this.terminoBusqueda.trim().toLowerCase();

    if (!normalizedTerm) {
      return productos;
    }

    return productos.filter((producto) => `${producto.value} ${producto.label}`.toLowerCase().includes(normalizedTerm));
  }

  private normalizarStockProducto(response: ProductoStockResponse): { almacenes: ProductoStockColor[]; stockLocal: number } {
    const almacenes = Array.isArray(response.data?.almacenes) ? response.data.almacenes : [];

    const almacenesNormalizados = almacenes
      .filter((item): item is NonNullable<typeof item> => !!item && typeof item === 'object' && !Array.isArray(item))
      .map((item) => {
        const almacen = item.almacen;
        const stock = Array.isArray(almacen?.stock)
          ? almacen.stock
              .filter((stockItem): stockItem is NonNullable<typeof stockItem> => !!stockItem && typeof stockItem === 'object' && !Array.isArray(stockItem))
              .map((stockItem) => ({
                nombre: typeof stockItem.nombre === 'string' ? stockItem.nombre.trim() : '',
                local: Number.isFinite(Number(stockItem.local ?? 0)) ? Number(stockItem.local ?? 0) : 0,
                estatus: Number.isFinite(Number(stockItem.estatus ?? 0)) ? Number(stockItem.estatus ?? 0) : 0,
                cantidad: Math.max(0, Number.isFinite(Number(stockItem.cantidad ?? 0)) ? Number(stockItem.cantidad ?? 0) : 0),
                diasLlegada: Math.max(0, Number.isFinite(Number(stockItem.dias_llegada ?? 0)) ? Number(stockItem.dias_llegada ?? 0) : 0),
                horaCierre: typeof stockItem.hora_cierre === 'string' ? stockItem.hora_cierre.trim() : ''
              }))
          : [];

        const totalFromApi = Number(almacen?.total ?? 0);
        const totalFromStock = stock.reduce((sum, item) => sum + item.cantidad, 0);

        return {
          color: typeof item.color === 'string' && item.color.trim() ? item.color.trim() : 'POR DEFINIR',
          imagen: this.normalizarImagenProducto(typeof item.imagen === 'string' ? item.imagen : ''),
          total: Math.max(0, Number.isFinite(totalFromApi) ? totalFromApi : totalFromStock),
          stock
        };
      });

    return {
      almacenes: almacenesNormalizados,
      stockLocal: Math.max(0, Number(response.data?.stockLocal ?? 0) || 0)
    };
  }

  private normalizarPrecioProducto(response: ProductoPrecioResponse): number {
    const precio = Number(response.data?.precio ?? 0);
    return Math.max(0, Number.isFinite(precio) ? precio : 0);
  }

  private normalizarImagenProducto(imagen: string): string {
    const clean = imagen.trim();
    if (!clean) {
      return '';
    }

    if (/^(https?:)?\/\//i.test(clean) || clean.startsWith('data:') || clean.startsWith('blob:')) {
      return clean;
    }

    const normalizedPath = clean.replace(/^\/+/, '');
    return `${environment.apiEnlacesUrl}/images/productos/${normalizedPath}`;
  }

  private loadClienteFromQueryParam(): void {
    const rawId = this.route.snapshot.queryParamMap.get('idCliente');
    if (!rawId) {
      this.clienteError = 'No se recibio el idCliente en la URL. Puedes buscar y seleccionar un cliente manualmente.';
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

  private formatearProductoColorCantidad(colores: CotizacionColorSeleccion[] | undefined): string {
    if (!colores || colores.length === 0) {
      return '';
    }

    return colores
      .filter((item) => item.cantidad > 0)
      .map((item) => `${item.color}:${item.cantidad}`)
      .join(',');
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
