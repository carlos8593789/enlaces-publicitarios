import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Subscription, catchError, map, of, switchMap, timer } from 'rxjs';

import { Remision } from '../../models/remision.model';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pizarra-remisiones',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './pizarra-remisiones.component.html',
  styleUrl: './pizarra-remisiones.component.scss'
})
export class PizarraRemisionesComponent implements OnInit, OnDestroy {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/remisiones`;
  private readonly congelarUrl = `${environment.apiBaseUrl}/api/remisiones/congelar`;
  private readonly pollingIntervalMs = 30000;
  private pollingSub?: Subscription;
  private since: number | null = null;
  remisiones: Remision[] = [];
  isLoading = false;
  errorMessage = '';
  qrModalOpen = false;
  qrImageUrl = '';
  qrTargetUrl = '';
  activePedidoId: number | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }

  startPolling(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.pollingSub = timer(0, this.pollingIntervalMs)
      .pipe(
        switchMap(() =>
          this.fetchRemisionesRequest().pipe(
            catchError(() => {
              this.errorMessage = 'No se pudieron cargar las remisiones.';
              return of({ data: [], next_since: this.since } as RemisionesResponse);
            })
          )
        )
      )
      .subscribe((response) => {
        const nuevos = Array.isArray(response.data) ? response.data : [];
        if (nuevos.length) {
          this.remisiones = [...nuevos, ...this.remisiones];
        }
        this.since = typeof response.next_since === 'number' ? response.next_since : this.since;
        this.isLoading = false;
      });
  }

  fetchRemisiones(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.since = null;
    this.fetchRemisionesRequest().subscribe({
      next: (response) => {
        this.remisiones = Array.isArray(response.data) ? response.data : [];
        this.since = typeof response.next_since === 'number' ? response.next_since : null;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las remisiones.';
        this.isLoading = false;
      }
    });
  }

  private fetchRemisionesRequest() {
    let params = new HttpParams();
    if (this.since !== null && this.since !== undefined) {
      params = params.set('since', String(this.since));
    }

    return this.http
      .get<RemisionesResponse>(this.apiUrl, { params })
      .pipe(
        map((response) => ({
          data: Array.isArray(response?.data) ? response.data : [],
          next_since: typeof response?.next_since === 'number' ? response.next_since : this.since
        }))
      );
  }

  openQrModal(idCliente: number | null | undefined, idPedido: number | null | undefined): void {
    if (!idCliente || Number.isNaN(idCliente)) {
      this.errorMessage = 'No se pudo generar el QR del cliente.';
      return;
    }
    if (!idPedido || Number.isNaN(idPedido)) {
      this.errorMessage = 'No se pudo obtener el pedido.';
      return;
    }
    const origin = window.location.origin;
    this.qrTargetUrl = `${origin}/cliente/procesar?idCliente=${idCliente}`;
    this.qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      this.qrTargetUrl
    )}`;
    this.activePedidoId = idPedido;
    this.qrModalOpen = true;
  }

  closeQrModal(): void {
    this.qrModalOpen = false;
    this.qrImageUrl = '';
    this.qrTargetUrl = '';
    const idPedido = this.activePedidoId;
    this.activePedidoId = null;
    if (!idPedido) {
      return;
    }
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    this.http.post(this.congelarUrl, { id_pedido: idPedido }, { headers }).subscribe({
      next: () => {
        this.remisiones = this.remisiones.filter((item) => item.id_pedido !== idPedido);
      },
      error: () => {
        this.errorMessage = 'No se pudo congelar la remisión.';
      }
    });
  }
}

interface RemisionesResponse {
  data: Remision[];
  next_since?: number | null;
}
