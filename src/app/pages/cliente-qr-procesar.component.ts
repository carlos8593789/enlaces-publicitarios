import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClienteDetalle, ClienteService } from '../services/cliente.service';
import {
  PedidoEntrega,
  ProductosPedidoEntregaResponse
} from '../models/producto-pedido-entrega.model';
import { ProductosPedidoEntregaService } from '../services/productos-pedido-entrega.service';
import {
  ProductosRemisionSurtirResponse,
  RemisionSurtirItem
} from '../models/productos-remision-surtir.model';
import { ProductosRemisionSurtirService } from '../services/productos-remision-surtir.service';
import { AuthService } from '../auth/auth.service';
import { ConfirmModalComponent } from '../shared/confirm-modal.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-cliente-qr-procesar',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './cliente-qr-procesar.component.html',
  styleUrl: './cliente-qr-procesar.component.scss'
})
export class ClienteQrProcesarComponent {
  @ViewChild('signatureCanvas') signatureCanvas?: ElementRef<HTMLCanvasElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly clienteService = inject(ClienteService);
  private readonly pedidosService = inject(ProductosPedidoEntregaService);
  private readonly remisionSurtirService = inject(ProductosRemisionSurtirService);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly entregaUrl = `${environment.apiEnlacesUrl}/api/MultipleEntrega`;
  private readonly surtirUrl = `${environment.apiBaseUrl}/api/remisiones/surtir`;
  private readonly imagenHost = `${environment.apiEnlacesUrl}/images/productos`;

  idCliente: number | null = null;
  cliente: ClienteDetalle | null = null;
  isLoading = false;
  errorMessage = '';
  pedidos: PedidoEntrega[] = [];
  pedidosLoading = false;
  pedidosError = '';
  remisionSurtir: RemisionSurtirItem[] = [];
  remisionSurtirLoading = false;
  remisionSurtirError = '';
  surtirLoading = false;
  surtirError = '';
  surtirSuccess = '';
  surtirConfirmOpen = false;

  signatureModalOpen = false;
  qrModalOpen = false;
  qrImageUrl = '';
  qrTargetUrl = '';
  signatureDataUrl: Record<number, string> = {};
  activePedidoId: number | null = null;
  isDrawing = false;
  hasSignature = false;
  photoFile: File | null = null;
  private signatureContext: CanvasRenderingContext2D | null = null;

  personaEntrega = '';
  comentariosEntrega = '';
  tipoEntrega = 1;
  pendingEntregaPayload: {
    pedidos: Array<{
      id_pedido: number;
      productos_entrega: Array<{
        id_producto: number;
        color: string;
        cantidad: number;
      }>;
      archivo: number;
    }>;
  } | null = null;
  entregaError = '';
  entregaSuccess = '';
  entregaSubmitting = false;

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const rawId = params.get('idCliente');
      this.idCliente = rawId ? Number(rawId) : null;
      this.fetchCliente();
    });
  }

  private fetchCliente(): void {
    this.errorMessage = '';
    this.cliente = null;

    if (this.idCliente === null || Number.isNaN(this.idCliente)) {
      this.errorMessage = 'No se recibió el idCliente en la URL.';
      this.pedidosError = 'No se recibió el idCliente en la URL.';
      this.remisionSurtirError = 'No se recibió el idCliente en la URL.';
      this.pedidos = [];
      this.remisionSurtir = [];
      return;
    }

    this.isLoading = true;
    this.clienteService.getClienteById(this.idCliente).subscribe({
      next: (response) => {
        this.cliente = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la información del cliente.';
        this.isLoading = false;
      }
    });

    this.fetchRemisionSurtir();
    this.fetchPedidos();
  }

  private fetchPedidos(): void {
    if (this.idCliente === null || Number.isNaN(this.idCliente)) {
      return;
    }

    this.pedidosLoading = true;
    this.pedidosError = '';
    this.pedidos = [];

    this.pedidosService.getByClienteId(this.idCliente).subscribe({
      next: (response: ProductosPedidoEntregaResponse) => {
        this.pedidos = Array.isArray(response?.data) ? response.data : [];
        this.pedidosLoading = false;
      },
      error: () => {
        this.pedidosError = 'No se pudieron cargar los pedidos del cliente.';
        this.pedidosLoading = false;
      }
    });
  }

  private fetchRemisionSurtir(): void {
    if (this.idCliente === null || Number.isNaN(this.idCliente)) {
      return;
    }

    this.remisionSurtirLoading = true;
    this.remisionSurtirError = '';
    this.remisionSurtir = [];

    this.remisionSurtirService.getByClienteId(this.idCliente).subscribe({
      next: (response: ProductosRemisionSurtirResponse) => {
        this.remisionSurtir = Array.isArray(response?.data) ? response.data : [];
        this.remisionSurtirLoading = false;
      },
      error: () => {
        this.remisionSurtirError = 'No se pudieron cargar las remisiones a surtir.';
        this.remisionSurtirLoading = false;
      }
    });
  }

  openSurtirConfirm(): void {
    this.surtirConfirmOpen = true;
  }

  closeSurtirConfirm(): void {
    this.surtirConfirmOpen = false;
  }

  confirmSurtirMercancia(): void {
    this.closeSurtirConfirm();
    this.executeSurtirMercancia();
  }

  private executeSurtirMercancia(): void {
    const ids = this.remisionSurtir.map((item) => item.id).filter((id) => Number.isFinite(id));
    if (ids.length === 0) {
      this.surtirError = 'No hay remisiones para surtir.';
      this.surtirSuccess = '';
      return;
    }

    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.surtirLoading = true;
    this.surtirError = '';
    this.surtirSuccess = '';

    this.http.post(this.surtirUrl, { id_remisiones: ids }, { headers }).subscribe({
      next: () => {
        this.surtirLoading = false;
        this.surtirSuccess = 'Remisiones enviadas a surtir.';
        this.fetchRemisionSurtir();
      },
      error: () => {
        this.surtirLoading = false;
        this.surtirError = 'No se pudo surtir la mercancia.';
      }
    });
  }

  startEntrega(): void {
    this.activePedidoId = null;
    this.entregaError = '';
    this.entregaSuccess = '';
    this.entregaSubmitting = false;
    this.personaEntrega = '';
    this.comentariosEntrega = '';
    this.tipoEntrega = 1;
    this.hasSignature = false;

    if (this.pedidos.length === 0) {
      this.entregaError = 'No hay pedidos para entregar.';
      return;
    }

    const payload = {
      pedidos: this.pedidos.map((pedido) => ({
        id_pedido: pedido.id,
        productos_entrega: pedido.detalles.map((detalle) => ({
          id_producto: detalle.id,
          color: detalle.color_producto,
          cantidad: detalle.cantidad_remisionada
        })),
        archivo: 1
      }))
    };

    this.pendingEntregaPayload = payload;
    this.openSignatureModal();
  }

  openSignatureModal(): void {
    this.signatureModalOpen = true;
    requestAnimationFrame(() => this.setupSignatureCanvas());
  }

  closeSignatureModal(): void {
    this.signatureModalOpen = false;
    this.endDraw();
    this.activePedidoId = null;
    this.photoFile = null;
  }

  clearSignature(): void {
    const canvas = this.signatureCanvas?.nativeElement;
    if (!canvas || !this.signatureContext) {
      return;
    }
    this.signatureContext.clearRect(0, 0, canvas.width, canvas.height);
    this.hasSignature = false;
    if (this.activePedidoId !== null) {
      delete this.signatureDataUrl[this.activePedidoId];
    }
  }

  saveSignature(): void {
    const canvas = this.signatureCanvas?.nativeElement;
    if (!canvas) {
      return;
    }
    if (!this.hasSignature) {
      this.entregaError = 'La firma es obligatoria.';
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');

    this.pedidos.forEach((pedido) => {
      this.signatureDataUrl[pedido.id] = dataUrl;
    });

    if (!this.pendingEntregaPayload) {
      this.closeSignatureModal();
      return;
    }

    const firmaBlob = this.dataUrlToBlob(dataUrl);
    const formData = new FormData();
    formData.append('payload', JSON.stringify(this.pendingEntregaPayload));
    formData.append('ArchivoFinal', firmaBlob, 'firma.png');
    if (this.photoFile) {
      formData.append('ArchivoFinal2', this.photoFile, this.photoFile.name || 'foto.jpg');
    }

    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.entregaSubmitting = true;
    this.entregaError = '';
    this.entregaSuccess = '';

    this.http.post(this.entregaUrl, formData, { headers }).subscribe({
      next: () => {
        this.entregaSubmitting = false;
        this.entregaSuccess = 'Entrega registrada con firma.';
        this.pendingEntregaPayload = null;
        this.photoFile = null;
        this.closeSignatureModal();
        this.fetchPedidos();
      },
      error: () => {
        this.entregaSubmitting = false;
        this.entregaError = 'No se pudo registrar la entrega con firma.';
      }
    });
  }

  openQrModal(): void {
    if (this.idCliente === null || Number.isNaN(this.idCliente)) {
      this.entregaError = 'No se recibió el idCliente en la URL.';
      return;
    }

    const origin = window.location.origin;
    this.qrTargetUrl = `${origin}/cliente/procesar?idCliente=${this.idCliente}`;
    this.qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      this.qrTargetUrl
    )}`;
    this.qrModalOpen = true;
  }

  closeQrModal(): void {
    this.qrModalOpen = false;
    this.qrImageUrl = '';
    this.qrTargetUrl = '';
  }

  startDraw(event: PointerEvent): void {
    if (!this.signatureContext) {
      this.setupSignatureCanvas();
    }
    const point = this.getCanvasPoint(event);
    if (!point || !this.signatureContext) {
      return;
    }
    this.hasSignature = true;
    this.isDrawing = true;
    this.signatureContext.beginPath();
    this.signatureContext.moveTo(point.x, point.y);
  }

  draw(event: PointerEvent): void {
    if (!this.isDrawing || !this.signatureContext) {
      return;
    }
    const point = this.getCanvasPoint(event);
    if (!point) {
      return;
    }
    this.signatureContext.lineTo(point.x, point.y);
    this.signatureContext.stroke();
  }

  endDraw(): void {
    if (!this.isDrawing || !this.signatureContext) {
      return;
    }
    this.signatureContext.closePath();
    this.isDrawing = false;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    this.photoFile = file;
  }

  private setupSignatureCanvas(): void {
    const canvas = this.signatureCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.signatureContext = canvas.getContext('2d');
    if (this.signatureContext) {
      this.signatureContext.lineWidth = 2;
      this.signatureContext.lineCap = 'round';
      this.signatureContext.strokeStyle = '#1f2937';
    }
  }

  private getCanvasPoint(event: PointerEvent): { x: number; y: number } | null {
    const canvas = this.signatureCanvas?.nativeElement;
    if (!canvas) {
      return null;
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const [header, data] = dataUrl.split(',');
    const mimeMatch = header.match(/data:(.*);base64/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const binary = atob(data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  getImagenUrl(imagen: string): string {
    if (!imagen) {
      return '';
    }
    if (/^https?:\/\//i.test(imagen)) {
      return imagen;
    }
    const trimmed = imagen.replace(/^\/+/, '');
    return `${this.imagenHost}/${trimmed}`;
  }
}
