import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClienteDetalle {
  id: number;
  nombre: string;
  email: string;
  empresa: string;
  distribuidor?: number;
  telefono?: string;
  celular?: string;
  telefono_contacto?: string;
}

export interface ClienteResponse {
  data: ClienteDetalle;
}

export interface ClienteBusquedaItem {
  id: number;
  telefono: string;
  email: string;
  distribuidor: number;
  porcentaje_descuento: number | null;
  value: string;
  label: string;
}

export interface ClienteBusquedaResponse {
  success: boolean;
  message: string;
  data: ClienteBusquedaItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/clientes`;
  private readonly buscadorUrl = `${environment.apiBaseUrl}/api/clientes-buscar`;

  constructor(private readonly http: HttpClient) {}

  getClienteById(idCliente: number): Observable<ClienteResponse> {
    if (!idCliente || Number.isNaN(idCliente)) {
      return throwError(() => new Error('ID de cliente inválido.'));
    }

    return this.http.get<ClienteResponse>(`${this.apiUrl}/${idCliente}`);
  }

  searchClientes(term: string): Observable<ClienteBusquedaItem[]> {
    const normalizedTerm = term.trim();
    if (!normalizedTerm) {
      return of([]);
    }

    return this.http
      .get<ClienteBusquedaResponse>(this.buscadorUrl, {
        params: { term: normalizedTerm }
      })
      .pipe(
        map((response) => (Array.isArray(response?.data) ? response.data : [])),
        catchError(() => of([]))
      );
  }
}
