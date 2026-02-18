import { Component, HostListener, inject } from '@angular/core';
import { NgIf, DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { ClientHeaderComponent } from './client-header.component';
import { ClientSidebarComponent } from './client-sidebar.component';
import { ClientFooterComponent } from './client-footer.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, ClientHeaderComponent, ClientSidebarComponent, ClientFooterComponent, NgIf],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.scss'
})
export class ClientLayoutComponent {
  private readonly document = inject(DOCUMENT);
  isFullscreen = false;
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.setBodyScrollLock(this.isMenuOpen);
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.setBodyScrollLock(false);
  }

  private setBodyScrollLock(locked: boolean): void {
    if (locked) {
      this.document.body.style.overflow = 'hidden';
      return;
    }
    this.document.body.style.overflow = '';
  }

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
    if (this.isFullscreen) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMenuOpen) {
      this.closeMenu();
      return;
    }
    if (this.document.fullscreenElement) {
      this.document.exitFullscreen?.();
    }
  }
}
