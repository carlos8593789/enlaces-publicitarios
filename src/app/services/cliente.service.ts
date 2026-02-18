import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

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
  private readonly apiUrl = 'http://127.0.0.1:8000/api/clientes';

  constructor(private readonly http: HttpClient) {}

  getClienteById(idCliente: number): Observable<ClienteResponse> {
    if (!idCliente || Number.isNaN(idCliente)) {
      return throwError(() => new Error('ID de cliente inválido.'));
    }

    return this.http.get<ClienteResponse>(`${this.apiUrl}/${idCliente}`);
  }
}
