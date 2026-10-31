import { CotizacionColorSeleccion, CotizacionProducto } from '../../../models/cotizacion-producto.model';
import { ProductoStockColor } from '../../../services/cotizacion-productos.service';

export interface StockColorItem extends ProductoStockColor {
  cantidadSeleccionada: number;
}

export type DescuentoAlcance = 'productos' | 'tecnicas' | 'todo';

export type ModoModalTecnicas = 'crear' | 'agregar-linea' | 'editar-linea';

export interface ProductoPendiente {
  producto: CotizacionProducto;
  cantidad: number;
  descripcion: string;
  coloresSeleccionados: CotizacionColorSeleccion[];
  precioUnitario: number;
  montoReglaNegocio: number;
}
