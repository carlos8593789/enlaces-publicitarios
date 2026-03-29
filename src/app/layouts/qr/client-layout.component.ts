import { Component, HostListener, inject } from '@angular/core';
import { NgIf, DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { ClientHeaderComponent } from './header/client-header.component';
import { ClientFooterComponent } from './footer/client-footer.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, ClientHeaderComponent, ClientFooterComponent, NgIf],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.scss'
})
export class ClientLayoutComponent {
  private readonly document = inject(DOCUMENT);
  isFullscreen = false;

  toggleFullscreen(): void {
    if (!this.document.fullscreenElement) {
      this.document.documentElement?.requestFullscreen?.();
    } else {
      this.document.exitFullscreen?.();
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen = Boolean(this.document.fullscreenElement);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.document.fullscreenElement) {
      this.document.exitFullscreen?.();
    }
  }
}
