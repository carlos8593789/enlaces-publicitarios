import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

import { CotizacionProducto } from '../models/cotizacion-producto.model';
import { environment } from '../../environments/environment';

interface BuscadorProductoItem {
  id: number;
  imagen: string;
  value: string;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class CotizacionProductosService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/productos-stock-buscar`;

  private readonly fallbackCatalogo: CotizacionProducto[] = [
    { id: 101, clave: 'SILLA-ECO', nombre: 'Silla ecologica', precioUnitario: 320, imagen: '' },
    { id: 102, clave: 'MESA-PLEG', nombre: 'Mesa plegable', precioUnitario: 1190, imagen: '' },
    { id: 103, clave: 'LONA-2X1', nombre: 'Lona publicitaria 2x1', precioUnitario: 450, imagen: '' },
    { id: 104, clave: 'VINIL-IMP', nombre: 'Vinil impreso mate', precioUnitario: 285, imagen: '' },
    { id: 105, clave: 'STAND-X', nombre: 'Stand tipo X', precioUnitario: 790, imagen: '' },
    { id: 106, clave: 'VOLANTE-1K', nombre: 'Volante 1,000 pzas', precioUnitario: 640, imagen: '' },
    { id: 107, clave: 'PLAYERA-S', nombre: 'Playera sublimada', precioUnitario: 210, imagen: '' },
    { id: 108, clave: 'TAZA-PUB', nombre: 'Taza publicitaria', precioUnitario: 128, imagen: '' }
  ];

  constructor(private readonly http: HttpClient) {}

  searchProductos(termino: string): Observable<CotizacionProducto[]> {
    const normalizedTerm = termino.trim().toLowerCase();
    const params = new HttpParams().set('term', termino.trim());

    return this.http.get<unknown>(this.apiUrl, { params }).pipe(
      map((response) => this.normalizeProductos(response, normalizedTerm)),
      catchError(() => of(this.filterFallback(normalizedTerm)))
    );
  }

  private normalizeProductos(response: unknown, normalizedTerm: string): CotizacionProducto[] {
    const items = this.extractArray(response);
    const normalized = this.normalizeFromBuscador(items) ?? this.normalizeFromCatalog(items);

    if (normalized.length === 0) {
      return this.filterFallback(normalizedTerm);
    }

    return this.filterByTerm(this.uniqueById(normalized), normalizedTerm);
  }

  private normalizeFromBuscador(items: unknown[]): CotizacionProducto[] | null {
    if (items.length === 0) {
      return [];
    }

    const parsed: BuscadorProductoItem[] = [];

    for (const item of items) {
      const record = this.asRecord(item);
      if (!record) {
        return null;
      }

      const id = this.toNumber(record['id']);
      const imagen =
        this.toString(record['imagen']) ||
        this.toString(record['image']) ||
        this.toString(record['foto']) ||
        this.toString(record['url_imagen']);
      const value = this.toString(record['value']);
      const label = this.toString(record['label']);

      if (id === null || !value || !label) {
        return null;
      }

      parsed.push({ id, imagen, value, label });
    }

    return parsed.map((item) => ({
      id: item.id,
      nombre: item.value,
      clave: item.label,
      precioUnitario: 0,
      imagen: this.normalizeImagenUrl(item.imagen)
    }));
  }

  private normalizeFromCatalog(items: unknown[]): CotizacionProducto[] {
    return items
      .map((item) => this.normalizeProducto(item))
      .filter((item): item is CotizacionProducto => item !== null);
  }

  private extractArray(response: unknown): unknown[] {
    if (Array.isArray(response)) {
      return response;
    }

    const record = this.asRecord(response);
    if (!record) {
      return [];
    }

    const data = record['data'];
    if (Array.isArray(data)) {
      return data;
    }

    return [];
  }

  private normalizeProducto(item: unknown): CotizacionProducto | null {
    const record = this.asRecord(item);
    if (!record) {
      return null;
    }

    const id = this.toNumber(record['id']) ?? this.toNumber(record['id_producto']);
    if (id === null) {
      return null;
    }

    const clave =
      this.toString(record['clave']) ||
      this.toString(record['sku']) ||
      this.toString(record['codigo']) ||
      `PROD-${id}`;

    const nombre =
      this.toString(record['nombre']) ||
      this.toString(record['descripcion']) ||
      this.toString(record['producto']) ||
      `Producto ${id}`;

    const precioUnitario =
      this.toNumber(record['precio']) ??
      this.toNumber(record['precio_unitario']) ??
      this.toNumber(record['costo']) ??
      this.toNumber(record['costo_unitario']) ??
      0;

    const imagenRaw =
      this.toString(record['imagen']) ||
      this.toString(record['image']) ||
      this.toString(record['foto']) ||
      this.toString(record['url_imagen']);

    return {
      id,
      clave,
      nombre,
      precioUnitario: Math.max(precioUnitario, 0),
      imagen: this.normalizeImagenUrl(imagenRaw)
    };
  }

  private normalizeImagenUrl(imagen: string): string {
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

  private uniqueById(productos: CotizacionProducto[]): CotizacionProducto[] {
    const mapById = new Map<number, CotizacionProducto>();

    productos.forEach((producto) => {
      mapById.set(producto.id, producto);
    });

    return Array.from(mapById.values());
  }

  private filterFallback(normalizedTerm: string): CotizacionProducto[] {
    return this.filterByTerm(this.fallbackCatalogo, normalizedTerm);
  }

  private filterByTerm(productos: CotizacionProducto[], normalizedTerm: string): CotizacionProducto[] {
    if (!normalizedTerm) {
      return productos;
    }

    return productos.filter((producto) => {
      const searchable = `${producto.clave} ${producto.nombre}`.toLowerCase();
      return searchable.includes(normalizedTerm);
    });
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, unknown>;
  }

  private toString(value: unknown): string {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    return '';
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }
}
