import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ClienteBusquedaItem, ClienteDetalle, ClienteService } from '../../../services/cliente.service';
import { environment } from '../../../../environments/environment';
import {
  CotizacionColorSeleccion,
  CotizacionLinea,
  CotizacionProducto
} from '../../../models/cotizacion-producto.model';
import { TecnicaImpresionApiItem, TecnicaImpresionSeleccion } from '../../../models/tecnicas-impresion.model';
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
import {
  TecnicaImpresionPrecioResponse,
  TecnicasImpresionService
} from '../../../services/tecnicas-impresion.service';

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
  private readonly clienteService = inject(ClienteService);
  private readonly condicionesVentaService = inject(CondicionesVentaService);
  private readonly productosService = inject(CotizacionProductosService);
  private readonly cotizacionesService = inject(CotizacionesService);
  private readonly tecnicasImpresionService = inject(TecnicasImpresionService);

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
  descripcionProductoModal = '';
  lineaEditando: CotizacionLinea | null = null;
  cargandoStockProducto = false;
  calculandoPrecioProducto = false;
  stockProductoError = '';
  coloresStockProducto: StockColorItem[] = [];
  stockLocalProducto = 0;
  confirmarTecnicasImpresionAbierto = false;
  modalTecnicasImpresionAbierto = false;
  cargandoTecnicasImpresion = false;
  calculandoPrecioTecnicas = false;
  tecnicasImpresionError = '';
  tecnicasImpresionCatalogo: TecnicaImpresionSeleccion[] = [];
  lineaTecnicasEditando: CotizacionLinea | null = null;
  modoModalTecnicas: 'crear' | 'agregar-linea' | 'editar-linea' = 'crear';

  productoPendienteAgregar:
    | {
        producto: CotizacionProducto;
        cantidad: number;
        descripcion: string;
        coloresSeleccionados: CotizacionColorSeleccion[];
        precioUnitario: number;
        montoReglaNegocio: number;
      }
    | null = null;

  lineasCotizacion: CotizacionLinea[] = [];
  idsAlmacenCotizacion: number[] = [];

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
    const cambioCliente = this.clienteId !== null && this.clienteId !== cliente.id;

    if (cambioCliente && this.lineasCotizacion.length > 0) {
      this.limpiarCotizacion();
      this.busquedaInfo = 'Se vacio la cotizacion al cambiar de cliente para recalcular precios.';
    }

    this.clienteId = cliente.id;
    this.cliente = {
      id: cliente.id,
      nombre: cliente.value,
      email: cliente.email,
      empresa: '',
      distribuidor: cliente.distribuidor,
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
    if (this.clienteId === null) {
      this.productosError = 'Debes seleccionar un cliente antes de agregar productos.';
      return;
    }

    this.lineaEditando = null;
    this.productoSeleccionado = producto;
    this.descripcionProductoModal = (producto.descripcioncorta || producto.label || '').trim();
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
    this.descripcionProductoModal = (linea.descripcion || linea.descripcioncorta || linea.label || '').trim();
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
    this.descripcionProductoModal = '';
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

    const descripcionCapturada =
      this.descripcionProductoModal.trim() ||
      (this.productoSeleccionado.descripcioncorta || this.productoSeleccionado.label || '').trim();

    this.calculandoPrecioProducto = true;
    this.stockProductoError = '';

    const idsAlmacenes = this.obtenerIdsAlmacenParaPrecio(this.productoSeleccionado.id_almacen);

    this.productosService.getProductoPrecio(
      this.productoSeleccionado.id,
      this.clienteId,
      cantidad,
      idsAlmacenes
    ).subscribe({
      next: (response: ProductoPrecioResponse) => {
        const { precioUnitario, montoReglaNegocio } = this.normalizarPrecioProducto(response);
        const producto = this.productoSeleccionado;
        if (!producto) {
          this.calculandoPrecioProducto = false;
          return;
        }

        const lineaEditando = this.lineaEditando;

        if (lineaEditando) {
          this.actualizarLineaDesdeModal(
            lineaEditando,
            cantidad,
            descripcionCapturada,
            coloresSeleccionados,
            precioUnitario,
            montoReglaNegocio
          );
          this.busquedaInfo = `Se actualizo ${cantidad} pza(s) de: ${producto.value}`;
          this.calculandoPrecioProducto = false;
          this.cerrarModalCantidad();
          return;
        }

        this.calculandoPrecioProducto = false;
        this.productoPendienteAgregar = {
          producto,
          cantidad,
          descripcion: descripcionCapturada,
          coloresSeleccionados,
          precioUnitario,
          montoReglaNegocio
        };
        this.cerrarModalCantidad();
        this.confirmarTecnicasImpresionAbierto = true;
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

  cancelarConfirmacionTecnicas(): void {
    this.confirmarTecnicasImpresionAbierto = false;
    this.productoPendienteAgregar = null;
  }

  confirmarAgregarSinTecnicas(): void {
    const pendiente = this.productoPendienteAgregar;
    if (!pendiente) {
      this.cancelarConfirmacionTecnicas();
      return;
    }

    this.confirmarTecnicasImpresionAbierto = false;
    this.finalizarAgregarProducto(pendiente, []);
  }

  abrirModalTecnicasImpresion(): void {
    const pendiente = this.productoPendienteAgregar;
    if (!pendiente) {
      this.cancelarConfirmacionTecnicas();
      return;
    }

    this.confirmarTecnicasImpresionAbierto = false;
    this.modoModalTecnicas = 'crear';
    this.cargarCatalogoTecnicas(pendiente.producto.id);
  }

  abrirModalAgregarTecnicas(linea: CotizacionLinea): void {
    this.lineaTecnicasEditando = linea;
    this.modoModalTecnicas = 'agregar-linea';
    this.productoPendienteAgregar = {
      producto: linea,
      cantidad: linea.cantidad,
      descripcion: (linea.descripcion || linea.descripcioncorta || linea.label || '').trim(),
      coloresSeleccionados: linea.coloresSeleccionados ?? [],
      precioUnitario: linea.precioUnitario,
      montoReglaNegocio: linea.montoReglaNegocio
    };

    this.cargarCatalogoTecnicas(linea.id, linea.tecnicasImpresion ?? [], true);
  }

  abrirModalEditarTecnicas(linea: CotizacionLinea): void {
    this.lineaTecnicasEditando = linea;
    this.modoModalTecnicas = 'editar-linea';
    this.productoPendienteAgregar = {
      producto: linea,
      cantidad: linea.cantidad,
      descripcion: (linea.descripcion || linea.descripcioncorta || linea.label || '').trim(),
      coloresSeleccionados: linea.coloresSeleccionados ?? [],
      precioUnitario: linea.precioUnitario,
      montoReglaNegocio: linea.montoReglaNegocio
    };

    this.cargarCatalogoTecnicas(linea.id, linea.tecnicasImpresion ?? []);
  }

  eliminarTecnica(linea: CotizacionLinea, idTecnica: number): void {
    linea.tecnicasImpresion = (linea.tecnicasImpresion ?? []).filter((tecnica) => tecnica.id_tecnica !== idTecnica);
    this.busquedaInfo = `Se elimino una tecnica de impresion de: ${linea.value}`;
  }

  cerrarModalTecnicasImpresion(): void {
    this.modalTecnicasImpresionAbierto = false;
    this.cargandoTecnicasImpresion = false;
    this.calculandoPrecioTecnicas = false;
    this.tecnicasImpresionError = '';
    this.tecnicasImpresionCatalogo = [];
    this.productoPendienteAgregar = null;
    this.lineaTecnicasEditando = null;
    this.modoModalTecnicas = 'crear';
  }

  alternarTecnicaImpresion(item: TecnicaImpresionSeleccion, seleccionada: boolean): void {
    item.seleccionada = seleccionada;

    if (seleccionada) {
      item.piezasSeleccionadas = 0;
      item.tintasSeleccionadas = item.cantidad_tintas > 0 ? Math.max(1, item.tintasSeleccionadas || 1) : 0;
      item.posicionesSeleccionadas = item.cantidad_posiciones > 0 ? Math.max(1, item.posicionesSeleccionadas || 1) : 0;
      return;
    }

    item.piezasSeleccionadas = 0;
    item.tintasSeleccionadas = 0;
    item.posicionesSeleccionadas = 0;
    item.color = '';
    item.nota = '';
  }

  actualizarPiezasTecnica(item: TecnicaImpresionSeleccion, cantidad: number): void {
    const maximo = this.obtenerMaximoPiezasTecnica(item);
    const cantidadNumerica = Number(cantidad);
    const cantidadValida = Number.isFinite(cantidadNumerica) ? Math.max(0, Math.floor(cantidadNumerica)) : 0;
    item.piezasSeleccionadas = Math.min(cantidadValida, maximo);
  }

  actualizarTintasTecnica(item: TecnicaImpresionSeleccion, cantidad: number): void {
    const maximo = Math.max(0, Math.floor(item.cantidad_tintas));
    const cantidadNumerica = Number(cantidad);
    const cantidadValida = Number.isFinite(cantidadNumerica) ? Math.max(0, Math.floor(cantidadNumerica)) : 0;
    item.tintasSeleccionadas = Math.min(cantidadValida, maximo);
  }

  actualizarPosicionesTecnica(item: TecnicaImpresionSeleccion, cantidad: number): void {
    const maximo = Math.max(0, Math.floor(item.cantidad_posiciones));
    const cantidadNumerica = Number(cantidad);
    const cantidadValida = Number.isFinite(cantidadNumerica) ? Math.max(0, Math.floor(cantidadNumerica)) : 0;
    item.posicionesSeleccionadas = Math.min(cantidadValida, maximo);
  }

  actualizarColorTecnica(item: TecnicaImpresionSeleccion, color: string): void {
    item.color = typeof color === 'string' ? color : '';
  }

  confirmarTecnicasSeleccionadas(): void {
    const pendiente = this.productoPendienteAgregar;
    if (!pendiente) {
      this.cerrarModalTecnicasImpresion();
      return;
    }

    const tecnicasSeleccionadas = this.tecnicasImpresionCatalogo.filter((item) => item.seleccionada);
    const lineaTecnicasEditando = this.lineaTecnicasEditando;

    if (tecnicasSeleccionadas.length === 0) {
      if (lineaTecnicasEditando && this.modoModalTecnicas === 'editar-linea') {
        lineaTecnicasEditando.tecnicasImpresion = [];
        this.busquedaInfo = `Se actualizaron las tecnicas de impresion de: ${lineaTecnicasEditando.value}`;
        this.cerrarModalTecnicasImpresion();
        return;
      }

      this.cerrarModalTecnicasImpresion();
      return;
    }

    const piezasTecnicas = this.obtenerTotalPiezasTecnicasSeleccionadas(tecnicasSeleccionadas);

    if (piezasTecnicas <= 0) {
      this.tecnicasImpresionError = 'Captura la cantidad de piezas para al menos una tecnica de impresion.';
      return;
    }

    if (piezasTecnicas > pendiente.cantidad) {
      this.tecnicasImpresionError = 'La cantidad de piezas con tecnica no puede superar el total del producto.';
      return;
    }

    this.calcularPrecioTecnicasYFinalizar(pendiente, tecnicasSeleccionadas);
  }

  agregarProducto(
    producto: CotizacionProducto,
    cantidad = 1,
    descripcionProducto = '',
    coloresSeleccionados: CotizacionColorSeleccion[] = [],
    precioUnitario = 0,
    montoReglaNegocio = 0,
    tecnicasImpresion: TecnicaImpresionSeleccion[] = []
  ): void {
    const cantidadValida = Number.isFinite(cantidad) ? Math.max(1, Math.floor(cantidad)) : 1;
    const existente = this.lineasCotizacion.find((linea) => linea.id === producto.id);
    if (existente) {
      existente.cantidad += cantidadValida;
      existente.descripcion = (descripcionProducto || existente.descripcion || existente.descripcioncorta || existente.label || '').trim();
      existente.precioUnitario = precioUnitario;
      existente.montoReglaNegocio = montoReglaNegocio;
      existente.id_almacen = producto.id_almacen;
      existente.coloresSeleccionados = this.mezclarColoresSeleccionados(
        existente.coloresSeleccionados ?? [],
        coloresSeleccionados
      );
      existente.tecnicasImpresion = this.mezclarTecnicasImpresionSeleccionadas(
        existente.tecnicasImpresion ?? [],
        tecnicasImpresion
      );
      this.sincronizarIdsAlmacenCotizacion();
      return;
    }

    this.lineasCotizacion = [
      ...this.lineasCotizacion,
      {
        ...producto,
        descripcion: (descripcionProducto || producto.descripcioncorta || producto.label || '').trim(),
        precioUnitario,
        montoReglaNegocio,
        cantidad: cantidadValida,
        coloresSeleccionados,
        tecnicasImpresion
      }
    ];

    this.sincronizarIdsAlmacenCotizacion();
  }

  actualizarCantidad(linea: CotizacionLinea, cantidad: number): void {
    const cantidadValida = Number.isFinite(cantidad) ? Math.max(1, Math.floor(cantidad)) : 1;
    linea.cantidad = cantidadValida;

    if (this.clienteId === null) {
      return;
    }

    const idsAlmacenes = this.obtenerIdsAlmacenParaPrecio(linea.id_almacen);

    this.productosService.getProductoPrecio(linea.id, this.clienteId, cantidadValida, idsAlmacenes).subscribe({
      next: (response: ProductoPrecioResponse) => {
        const { precioUnitario, montoReglaNegocio } = this.normalizarPrecioProducto(response);
        linea.precioUnitario = precioUnitario;
        linea.montoReglaNegocio = montoReglaNegocio;
      }
    });
  }

  actualizarCantidadDesdeModal(linea: CotizacionLinea): void {
    this.abrirModalEditarCantidad(linea);
  }

  eliminarProducto(idProducto: number): void {
    this.lineasCotizacion = this.lineasCotizacion.filter((linea) => linea.id !== idProducto);
    this.sincronizarIdsAlmacenCotizacion();
  }

  limpiarCotizacion(): void {
    this.lineasCotizacion = [];
    this.idsAlmacenCotizacion = [];
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

    if (!this.riesgos.trim()) {
      this.crearCotizacionError = 'Completa el campo de riesgos antes de crear la cotizacion.';
      return;
    }

    if (!this.condicionesVenta.trim()) {
      this.crearCotizacionError = 'Completa el campo de condiciones de venta antes de crear la cotizacion.';
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
        descripcion: (linea.descripcion || linea.descripcioncorta || linea.label || '').trim(),
        porcentaje_descuento: 0,
        cantidad: linea.cantidad,
        tecnicas_impresion: (linea.tecnicasImpresion ?? [])
          .filter((tecnica) => Number(tecnica.id_tecnica) > 0 && Number(tecnica.piezasSeleccionadas) > 0)
          .map((tecnica) => ({
            idTecnica: Number(tecnica.id_tecnica),
            color: (tecnica.color || '').trim(),
            cantidad: Math.max(0, Math.floor(Number(tecnica.piezasSeleccionadas) || 0)),
            tintas: Math.max(0, Math.floor(Number(tecnica.tintasSeleccionadas) || 0)),
            posiciones: Math.max(0, Math.floor(Number(tecnica.posicionesSeleccionadas) || 0)),
            detalles: (tecnica.detalles || '').trim(),
            consideraciones: (tecnica.consideraciones || '').trim(),
            nota: (tecnica.nota || '').trim()
          }))
      }))
    };

    this.creandoCotizacion = true;

    this.cotizacionesService.createCotizacion(payload).subscribe({
      next: (response: CrearCotizacionResponse) => {
        this.crearCotizacionExito = `${response.message} #${response.data.id_cotizacion}`;
        this.lineasCotizacion = [];
        this.idsAlmacenCotizacion = [];
        this.creandoCotizacion = false;
      },
      error: () => {
        this.crearCotizacionError = 'No se pudo crear la cotizacion. Intenta nuevamente.';
        this.creandoCotizacion = false;
      }
    });
  }

  get subtotalProducto(): number {
    return this.lineasCotizacion.reduce((acc, linea) => acc + linea.precioUnitario * linea.cantidad, 0);
  }

  get subtotalTecnicasImpresion(): number {
    return this.lineasCotizacion.reduce((acc, linea) => acc + this.getTotalTecnicasPorLinea(linea), 0);
  }

  get totalTecnicasImpresion(): number {
    return this.subtotalTecnicasImpresion;
  }

  get subtotal(): number {
    return this.subtotalProducto + this.subtotalTecnicasImpresion + this.totalMontoReglaNegocio;
  }

  get iva(): number {
    return this.subtotal * this.ivaRate;
  }

  get totalMontoReglaNegocio(): number {
    return this.lineasCotizacion.reduce((acc, linea) => acc + linea.montoReglaNegocio, 0);
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

  formatearTecnicasImpresion(tecnicas: TecnicaImpresionSeleccion[] | undefined): string {
    if (!tecnicas || tecnicas.length === 0) {
      return '';
    }

    return tecnicas
      .map((item) => {
        const resumen = [item.nombre];
        if (item.piezasSeleccionadas > 0) {
          resumen.push(`${item.piezasSeleccionadas} pieza(s)`);
        }
        if (item.tintasSeleccionadas > 0) {
          resumen.push(`${item.tintasSeleccionadas} tinta(s)`);
        }
        if (item.posicionesSeleccionadas > 0) {
          resumen.push(`${item.posicionesSeleccionadas} posicion(es)`);
        }

        return resumen.join(' / ');
      })
      .join(' | ');
  }

  getTotalTecnicasPorLinea(linea: CotizacionLinea): number {
    return (linea.tecnicasImpresion ?? []).reduce((acc, tecnica) => acc + this.getTotalTecnica(tecnica), 0);
  }

  getTotalTecnica(tecnica: TecnicaImpresionSeleccion): number {
    const precioUnitario = Math.max(0, Number(tecnica.precioUnitario ?? 0));
    const piezas = Math.max(0, Number(tecnica.piezasSeleccionadas ?? 0));
    const cargoExtra = Math.max(0, Number(tecnica.cargoExtra ?? 0));

    return precioUnitario * piezas + cargoExtra;
  }

  obtenerOpcionesCantidad(maximo: number, minimo = 0): number[] {
    const maximoNormalizado = Math.max(0, Math.floor(Number(maximo) || 0));
    const minimoNormalizado = Math.max(0, Math.floor(Number(minimo) || 0));

    if (maximoNormalizado < minimoNormalizado) {
      return [];
    }

    return Array.from({ length: maximoNormalizado - minimoNormalizado + 1 }, (_valor, index) => minimoNormalizado + index);
  }

  obtenerTotalPiezasTecnicasSeleccionadas(tecnicas: TecnicaImpresionSeleccion[] | undefined = this.tecnicasImpresionCatalogo): number {
    if (!tecnicas || tecnicas.length === 0) {
      return 0;
    }

    return tecnicas.reduce((acc, item) => acc + Math.max(0, Math.floor(Number(item.piezasSeleccionadas) || 0)), 0);
  }

  obtenerMaximoPiezasTecnica(item: TecnicaImpresionSeleccion): number {
    const productoCantidad = Math.max(0, Math.floor(Number(this.productoPendienteAgregar?.cantidad ?? 0)));
    const piezasBloqueadas = this.getPiezasTecnicasExistentes();
    const piezasOtros = this.obtenerTotalPiezasTecnicasSeleccionadas(
      this.tecnicasImpresionCatalogo.filter((tecnica) => tecnica.seleccionada && tecnica.id_tecnica !== item.id_tecnica)
    );

    return Math.max(0, productoCantidad - piezasBloqueadas - piezasOtros);
  }

  getPiezasTecnicasExistentes(): number {
    if (this.modoModalTecnicas !== 'agregar-linea' || !this.lineaTecnicasEditando) {
      return 0;
    }

    return (this.lineaTecnicasEditando.tecnicasImpresion ?? []).reduce(
      (acc, tecnica) => acc + Math.max(0, Number(tecnica.piezasSeleccionadas ?? 0)),
      0
    );
  }

  trackByTecnicaImpresion(_index: number, item: TecnicaImpresionSeleccion): number {
    return item.id_tecnica;
  }

  private normalizarProductosBusqueda(response: ProductoBusquedaResponse): CotizacionProducto[] {
    const items = Array.isArray(response.data) ? response.data : [];

    const parsed = items
      .filter((item): item is NonNullable<typeof item> => !!item && typeof item === 'object' && !Array.isArray(item))
      .map((item) => {
        const clave = typeof item.clave === 'string' ? item.clave.trim() : '';
        const descripcioncorta = typeof item.descripcioncorta === 'string' ? item.descripcioncorta.trim() : '';
        const value =
          typeof item.value === 'string' && item.value.trim()
            ? item.value.trim()
            : descripcioncorta || clave;
        const label =
          typeof item.label === 'string' && item.label.trim()
            ? item.label.trim()
            : [value, clave].filter(Boolean).join(' ');

        return {
          id: Number(item.id ?? 0),
          clave,
          bbb: Number.isFinite(Number(item.bbb ?? 0)) ? Number(item.bbb ?? 0) : 0,
          aplica_regla: Number.isFinite(Number(item.aplica_regla ?? 0)) ? Number(item.aplica_regla ?? 0) : 0,
          descripcioncorta,
          value,
          label,
          imagen: typeof item.imagen === 'string' ? item.imagen : '',
          id_almacen: Number(item.id_almacen ?? 0)
        };
      })
      .filter((item) => Number.isFinite(item.id) && item.value)
      .map((item) => ({
        id: item.id,
        clave: item.clave,
        bbb: item.bbb,
        aplica_regla: item.aplica_regla,
        descripcioncorta: item.descripcioncorta,
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

  private normalizarPrecioProducto(response: ProductoPrecioResponse): {
    precioUnitario: number;
    montoReglaNegocio: number;
  } {
    const precio = Number(response.data?.precio ?? 0);
    const montoReglaNegocio = Number(response.data?.monto_regla_negocio ?? 0);

    return {
      precioUnitario: Math.max(0, Number.isFinite(precio) ? precio : 0),
      montoReglaNegocio: Math.max(0, Number.isFinite(montoReglaNegocio) ? montoReglaNegocio : 0)
    };
  }

  private normalizarTecnicasImpresion(items: TecnicaImpresionApiItem[] | undefined): TecnicaImpresionApiItem[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .filter((item): item is TecnicaImpresionApiItem => !!item && typeof item === 'object' && !Array.isArray(item))
      .map((item) => ({
        numero: typeof item.numero === 'string' ? item.numero.trim() : '',
        imagen: this.normalizarImagenTecnica(typeof item.imagen === 'string' ? item.imagen : ''),
        id_tecnica: Number(item.id_tecnica ?? 0),
        nombre: typeof item.nombre === 'string' ? item.nombre.trim() : '',
        consideraciones: typeof item.consideraciones === 'string' ? item.consideraciones.trim() : '',
        descripcion: typeof item.descripcion === 'string' ? item.descripcion.trim() : '',
        cantidad_posiciones: Math.max(
          0,
          Number.isFinite(Number(item.cantidad_posiciones ?? 0)) ? Number(item.cantidad_posiciones ?? 0) : 0
        ),
        cantidad_tintas: Math.max(0, Number.isFinite(Number(item.cantidad_tintas ?? 0)) ? Number(item.cantidad_tintas ?? 0) : 0)
      }))
      .filter((item) => Number.isFinite(item.id_tecnica) && item.nombre);
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

  private normalizarImagenTecnica(imagen: string): string {
    const clean = imagen.trim();
    if (!clean) {
      return '';
    }

    if (/^(https?:)?\/\//i.test(clean) || clean.startsWith('data:') || clean.startsWith('blob:')) {
      return clean;
    }

    const normalizedPath = clean.replace(/^\/+/, '').replace(/^small_/, '');
    return `${environment.apiEnlacesUrl}/images/tecnicas/small_${normalizedPath}`;
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

  private mezclarTecnicasImpresionSeleccionadas(
    base: TecnicaImpresionSeleccion[],
    incoming: TecnicaImpresionSeleccion[]
  ): TecnicaImpresionSeleccion[] {
    const merged = new Map<number, TecnicaImpresionSeleccion>();

    base.forEach((item) => {
      merged.set(item.id_tecnica, { ...item });
    });

    incoming.forEach((item) => {
      const existente = merged.get(item.id_tecnica);
      if (!existente) {
        merged.set(item.id_tecnica, { ...item });
        return;
      }

      existente.seleccionada = existente.seleccionada || item.seleccionada;
      existente.piezasSeleccionadas = Math.max(existente.piezasSeleccionadas, item.piezasSeleccionadas);
      existente.tintasSeleccionadas = Math.max(existente.tintasSeleccionadas, item.tintasSeleccionadas);
      existente.posicionesSeleccionadas = Math.max(existente.posicionesSeleccionadas, item.posicionesSeleccionadas);
      existente.color = (item.color || '').trim() || (existente.color || '').trim();
      existente.detalles = (item.detalles || '').trim() || (existente.detalles || '').trim();
      existente.consideraciones = (item.consideraciones || '').trim() || (existente.consideraciones || '').trim();
      existente.nota = (item.nota || '').trim() || (existente.nota || '').trim();
      existente.precioUnitario = Math.max(Number(existente.precioUnitario ?? 0), Number(item.precioUnitario ?? 0));
      existente.cargoExtra = Math.max(Number(existente.cargoExtra ?? 0), Number(item.cargoExtra ?? 0));
    });

    return Array.from(merged.values());
  }

  private calcularPrecioTecnicasYFinalizar(
    pendiente: {
      producto: CotizacionProducto;
      cantidad: number;
      descripcion: string;
      coloresSeleccionados: CotizacionColorSeleccion[];
      precioUnitario: number;
      montoReglaNegocio: number;
    },
    tecnicasSeleccionadas: TecnicaImpresionSeleccion[]
  ): void {
    this.calculandoPrecioTecnicas = true;
    this.tecnicasImpresionError = '';

    const solicitudes = tecnicasSeleccionadas.map((tecnica) =>
      this.tecnicasImpresionService.getPrecioTecnicaImpresion(
        tecnica.id_tecnica,
        tecnica.piezasSeleccionadas,
        tecnica.posicionesSeleccionadas,
        tecnica.tintasSeleccionadas
      )
    );

    forkJoin(solicitudes).subscribe({
      next: (responses) => {
        const tecnicasConPrecio = tecnicasSeleccionadas.map((tecnica, index) => {
          const precio = this.normalizarPrecioTecnicaImpresion(responses[index]);

          return {
            ...tecnica,
            precioUnitario: precio.precioUnitario,
            cargoExtra: precio.cargoExtra
          };
        });

        this.calculandoPrecioTecnicas = false;
        this.finalizarAgregarProducto(
          {
            ...pendiente,
            precioUnitario: pendiente.precioUnitario
          },
          tecnicasConPrecio
        );
      },
      error: () => {
        this.calculandoPrecioTecnicas = false;
        this.tecnicasImpresionError = 'No se pudo calcular el precio de las tecnicas de impresion.';
      }
    });
  }

  private finalizarAgregarProducto(
    pendiente: {
      producto: CotizacionProducto;
      cantidad: number;
      descripcion: string;
      coloresSeleccionados: CotizacionColorSeleccion[];
      precioUnitario: number;
      montoReglaNegocio: number;
    },
    tecnicasSeleccionadas: TecnicaImpresionSeleccion[]
  ): void {
    this.modalTecnicasImpresionAbierto = false;
    this.calculandoPrecioTecnicas = false;
    const lineaTecnicasEditando = this.lineaTecnicasEditando;
    const tecnicasNormalizadas = tecnicasSeleccionadas.map((item) => ({
      ...item,
      piezasSeleccionadas: Math.max(0, Math.floor(item.piezasSeleccionadas)),
      tintasSeleccionadas: Math.max(0, Math.floor(item.tintasSeleccionadas)),
      posicionesSeleccionadas: Math.max(0, Math.floor(item.posicionesSeleccionadas)),
      color: (item.color || '').trim(),
      detalles: (item.detalles || '').trim(),
      consideraciones: (item.consideraciones || '').trim(),
      nota: (item.nota || '').trim(),
      precioUnitario: Math.max(0, Number(item.precioUnitario ?? 0)),
      cargoExtra: Math.max(0, Number(item.cargoExtra ?? 0))
    }));

    if (lineaTecnicasEditando && this.modoModalTecnicas === 'editar-linea') {
      lineaTecnicasEditando.tecnicasImpresion = tecnicasNormalizadas;
      this.busquedaInfo = `Se actualizaron las tecnicas de impresion de: ${lineaTecnicasEditando.value}`;
      this.productoPendienteAgregar = null;
      this.tecnicasImpresionCatalogo = [];
      this.tecnicasImpresionError = '';
      this.lineaTecnicasEditando = null;
      this.modoModalTecnicas = 'crear';
      return;
    }

    if (lineaTecnicasEditando && this.modoModalTecnicas === 'agregar-linea') {
      lineaTecnicasEditando.tecnicasImpresion = [
        ...(lineaTecnicasEditando.tecnicasImpresion ?? []),
        ...tecnicasNormalizadas
      ];
      this.busquedaInfo = `Se agregaron tecnicas de impresion a: ${lineaTecnicasEditando.value}`;
      this.productoPendienteAgregar = null;
      this.tecnicasImpresionCatalogo = [];
      this.tecnicasImpresionError = '';
      this.lineaTecnicasEditando = null;
      this.modoModalTecnicas = 'crear';
      return;
    }

    this.agregarProducto(
      pendiente.producto,
      pendiente.cantidad,
      pendiente.descripcion,
      pendiente.coloresSeleccionados,
      pendiente.precioUnitario,
      pendiente.montoReglaNegocio,
      tecnicasNormalizadas
    );

    const resumenTecnicas = this.formatearResumenTecnicasImpresion(tecnicasNormalizadas);
    this.busquedaInfo = `Se agrego ${pendiente.cantidad} pza(s) de: ${pendiente.producto.value}${resumenTecnicas}`;
    this.productosEncontrados = [];
    this.terminoBusqueda = '';
    this.productoPendienteAgregar = null;
    this.tecnicasImpresionCatalogo = [];
    this.tecnicasImpresionError = '';
    this.lineaTecnicasEditando = null;
    this.modoModalTecnicas = 'crear';
  }

  private cargarCatalogoTecnicas(
    idProducto: number,
    seleccionadasPrevias: TecnicaImpresionSeleccion[] = [],
    excluirSeleccionadasPrevias = false
  ): void {
    this.modalTecnicasImpresionAbierto = true;
    this.cargandoTecnicasImpresion = true;
    this.calculandoPrecioTecnicas = false;
    this.tecnicasImpresionError = '';
    this.tecnicasImpresionCatalogo = [];

    const tecnicasPrevias = new Map(seleccionadasPrevias.map((item) => [item.id_tecnica, item] as const));

    this.tecnicasImpresionService.getTecnicasImpresion(idProducto).subscribe({
      next: (response) => {
        const tecnicas = this.normalizarTecnicasImpresion(response.data).filter(
          (item) => !excluirSeleccionadasPrevias || !tecnicasPrevias.has(item.id_tecnica)
        );
        this.tecnicasImpresionCatalogo = tecnicas.map((item) => {
          const previa = tecnicasPrevias.get(item.id_tecnica);

          return {
            ...item,
            seleccionada: !!previa,
            piezasSeleccionadas: previa?.piezasSeleccionadas ?? 0,
            tintasSeleccionadas: previa?.tintasSeleccionadas ?? (item.cantidad_tintas > 0 ? 1 : 0),
            posicionesSeleccionadas: previa?.posicionesSeleccionadas ?? (item.cantidad_posiciones > 0 ? 1 : 0),
            color: previa?.color ?? '',
            detalles: previa?.detalles ?? item.descripcion ?? '',
            consideraciones: previa?.consideraciones ?? item.consideraciones ?? '',
            nota: previa?.nota ?? '',
            precioUnitario: previa?.precioUnitario ?? 0,
            cargoExtra: previa?.cargoExtra ?? 0
          };
        });
        this.cargandoTecnicasImpresion = false;
      },
      error: () => {
        this.tecnicasImpresionError = 'No se pudieron cargar las tecnicas de impresion del producto.';
        this.cargandoTecnicasImpresion = false;
      }
    });
  }

  private normalizarPrecioTecnicaImpresion(response: TecnicaImpresionPrecioResponse): {
    precioUnitario: number;
    cargoExtra: number;
  } {
    const precio = Number(response.data?.precio ?? 0);
    const cargoExtra = Number(response.data?.cargo_extra ?? 0);

    return {
      precioUnitario: Math.max(0, Number.isFinite(precio) ? precio : 0),
      cargoExtra: Math.max(0, Number.isFinite(cargoExtra) ? cargoExtra : 0)
    };
  }

  private formatearResumenTecnicasImpresion(tecnicas: TecnicaImpresionSeleccion[]): string {
    if (!tecnicas || tecnicas.length === 0) {
      return '';
    }

    const resumen = tecnicas.map((item) => {
      const partes = [item.nombre];
      if (item.tintasSeleccionadas > 0) {
        partes.push(`${item.tintasSeleccionadas} tinta(s)`);
      }
      if (item.posicionesSeleccionadas > 0) {
        partes.push(`${item.posicionesSeleccionadas} posicion(es)`);
      }
      if ((item.color || '').trim()) {
        partes.push(`color: ${item.color.trim()}`);
      }
      return partes.join(' / ');
    });

    return ` con tecnica(s): ${resumen.join(' | ')}`;
  }

  private actualizarLineaDesdeModal(
    linea: CotizacionLinea,
    cantidad: number,
    descripcion: string,
    coloresSeleccionados: CotizacionColorSeleccion[],
    precioUnitario: number,
    montoReglaNegocio: number
  ): void {
    linea.cantidad = cantidad;
    linea.descripcion = (descripcion || linea.descripcioncorta || linea.label || '').trim();
    linea.coloresSeleccionados = coloresSeleccionados;
    linea.precioUnitario = precioUnitario;
    linea.montoReglaNegocio = montoReglaNegocio;
    this.sincronizarIdsAlmacenCotizacion();
  }

  private sincronizarIdsAlmacenCotizacion(): void {
    this.idsAlmacenCotizacion = Array.from(
      new Set(
        this.lineasCotizacion
          .map((linea) => Number(linea.id_almacen))
          .filter((idAlmacen) => Number.isFinite(idAlmacen) && idAlmacen > 0)
      )
    );
  }

  private obtenerIdsAlmacenParaPrecio(idAlmacenActual?: number): number[] {
    const ids = [...this.idsAlmacenCotizacion];

    if (Number.isFinite(idAlmacenActual) && Number(idAlmacenActual) > 0) {
      ids.push(Number(idAlmacenActual));
    }

    return Array.from(new Set(ids.filter((idAlmacen) => Number.isFinite(idAlmacen) && idAlmacen > 0)));
  }
}
