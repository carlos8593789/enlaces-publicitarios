import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);
  private readonly reader = new BrowserMultiFormatReader();
  private scanControls: IScannerControls | null = null;
  private successMessageTimer: ReturnType<typeof setTimeout> | null = null;

  isScanning = false;
  errorMessage = '';
  successMessage = '';

  ngAfterViewInit(): void {
    this.loadSuccessMessage();
    this.startScan();
  }

  ngOnDestroy(): void {
    this.stopScan();
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
      this.successMessageTimer = null;
    }
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
    this.router.navigate(['/qr/entregar'], {
      queryParams: { idCliente }
    });
  }

  private loadSuccessMessage(): void {
    const entregaParam = this.route.snapshot.queryParamMap.get('entrega');
    if (entregaParam !== 'ok') {
      return;
    }

    this.successMessage = 'La mercancia ya fue entregada.';
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }
    this.successMessageTimer = setTimeout(() => {
      this.successMessage = '';
      this.successMessageTimer = null;
    }, 5000);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { entrega: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private extractIdCliente(raw: string): number | null {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }

    const match = trimmed.match(/^idCliente=(\d+)$/);
    if (!match) {
      return null;
    }

    const id = Number(match[1]);
    return Number.isNaN(id) || !Number.isFinite(id) ? null : id;
  }
}
