import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClienteDetalle {
  id: number;
  nombre: string;
  email: string;
  empresa: string;
}

export interface ClienteResponse {
  data: ClienteDetalle;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/clientes`;

  constructor(private readonly http: HttpClient) {}

  getClienteById(idCliente: number): Observable<ClienteResponse> {
    if (!idCliente || Number.isNaN(idCliente)) {
      return throwError(() => new Error('ID de cliente inválido.'));
    }

    return this.http.get<ClienteResponse>(`${this.apiUrl}/${idCliente}`);
  }
}
