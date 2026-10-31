import { environment } from '../../../../../environments/environment';
import { CotizacionProducto } from '../../../../models/cotizacion-producto.model';
import { TecnicaImpresionApiItem } from '../../../../models/tecnicas-impresion.model';
import {
  ProductoBusquedaResponse,
  ProductoPrecioResponse,
  ProductoStockColor,
  ProductoStockResponse
} from '../../../../services/cotizacion-productos.service';
import { TecnicaImpresionPrecioResponse } from '../../../../services/tecnicas-impresion.service';

const esUrlAbsoluta = (valor: string): boolean =>
  /^(https?:)?\/\//i.test(valor) || valor.startsWith('data:') || valor.startsWith('blob:');

export function normalizarImagenProducto(imagen: string): string {
  const clean = imagen.trim();
  if (!clean) {
    return '';
  }

  if (esUrlAbsoluta(clean)) {
    return clean;
  }

  return `${environment.apiEnlacesUrl}/images/productos/${clean.replace(/^\/+/, '')}`;
}

export function normalizarImagenTecnica(imagen: string): string {
  const clean = imagen.trim();
  if (!clean) {
    return '';
  }

  if (esUrlAbsoluta(clean)) {
    return clean;
  }

  const normalizedPath = clean.replace(/^\/+/, '').replace(/^small_/, '');
  return `${environment.apiEnlacesUrl}/images/tecnicas/small_${normalizedPath}`;
}

export function normalizarTecnicasImpresion(items: TecnicaImpresionApiItem[] | undefined): TecnicaImpresionApiItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item): item is TecnicaImpresionApiItem => !!item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      numero: typeof item.numero === 'string' ? item.numero.trim() : '',
      imagen: normalizarImagenTecnica(typeof item.imagen === 'string' ? item.imagen : ''),
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

export function normalizarProductosBusqueda(response: ProductoBusquedaResponse, termino: string): CotizacionProducto[] {
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
      imagen: normalizarImagenProducto(item.imagen),
      id_almacen: Number.isFinite(item.id_almacen) ? item.id_almacen : 0
    }));

  const productos = Array.from(new Map(parsed.map((item) => [item.id, item] as const)).values());
  const normalizedTerm = termino.trim().toLowerCase();

  if (!normalizedTerm) {
    return productos;
  }

  return productos.filter((producto) => `${producto.value} ${producto.label}`.toLowerCase().includes(normalizedTerm));
}

export function normalizarStockProducto(response: ProductoStockResponse): {
  almacenes: ProductoStockColor[];
  stockLocal: number;
} {
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
        imagen: normalizarImagenProducto(typeof item.imagen === 'string' ? item.imagen : ''),
        total: Math.max(0, Number.isFinite(totalFromApi) ? totalFromApi : totalFromStock),
        stock
      };
    });

  return {
    almacenes: almacenesNormalizados,
    stockLocal: Math.max(0, Number(response.data?.stockLocal ?? 0) || 0)
  };
}

export function normalizarPrecioProducto(response: ProductoPrecioResponse): {
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

export function normalizarPrecioTecnicaImpresion(response: TecnicaImpresionPrecioResponse): {
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
