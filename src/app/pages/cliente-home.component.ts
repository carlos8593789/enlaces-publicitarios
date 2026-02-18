import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

@Component({
  selector: 'app-cliente-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cliente-home.component.html',
  styleUrl: './cliente-home.component.scss'
})
export class ClienteHomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;

  private readonly router = inject(Router);
  private readonly reader = new BrowserMultiFormatReader();
  private scanControls: IScannerControls | null = null;

  isScanning = false;
  errorMessage = '';

  ngAfterViewInit(): void {
    this.startScan();
  }

  ngOnDestroy(): void {
    this.stopScan();
  }

  startScan(): void {
    if (this.isScanning) {
      return;
    }

    this.errorMessage = '';
    this.isScanning = true;

    this.reader
      .decodeFromVideoDevice(undefined, this.videoElement.nativeElement, (result, error, controls) => {
        if (controls) {
          this.scanControls = controls;
        }
        if (result) {
          this.onResult(result.getText());
        }
        if (error) {
          // se ignoran errores de lectura intermitentes
        }
      })
      .then((controls) => {
        this.scanControls = controls;
      })
      .catch((err: Error) => {
        this.errorMessage = err.message || 'No se pudo acceder a la cámara.';
        this.isScanning = false;
      });
  }

  stopScan(): void {
    if (this.scanControls) {
      this.scanControls.stop();
      this.scanControls = null;
    }
    this.isScanning = false;
  }

  simulateScan(): void {
    this.navigateToProcesar(6);
  }

  private onResult(text: string): void {
    const idCliente = this.extractIdCliente(text);
    if (idCliente === null) {
      this.errorMessage = 'El QR no contiene un idCliente válido.';
      return;
    }

    this.stopScan();
    this.navigateToProcesar(idCliente);
  }

  private navigateToProcesar(idCliente: number): void {
    this.router.navigate(['/cliente/procesar'], {
      queryParams: { idCliente }
    });
  }

  private extractIdCliente(raw: string): number | null {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }

    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
      return numeric;
    }

    try {
      const parsed = JSON.parse(trimmed) as { idCliente?: number; id_cliente?: number };
      if (typeof parsed?.idCliente === 'number') {
        return parsed.idCliente;
      }
      if (typeof parsed?.id_cliente === 'number') {
        return parsed.id_cliente;
      }
    } catch {
      // no es JSON
    }

    try {
      const url = new URL(trimmed);
      const idParam = url.searchParams.get('idCliente') ?? url.searchParams.get('id_cliente');
      const id = idParam ? Number(idParam) : NaN;
      return Number.isNaN(id) ? null : id;
    } catch {
      return null;
    }
  }
}
