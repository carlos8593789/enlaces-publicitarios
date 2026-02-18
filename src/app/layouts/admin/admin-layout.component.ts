import { Component, HostListener, inject } from '@angular/core';
import { NgIf, DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { AdminHeaderComponent } from './admin-header.component';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { AdminFooterComponent } from './admin-footer.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminHeaderComponent, AdminSidebarComponent, AdminFooterComponent, NgIf],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  private readonly document = inject(DOCUMENT);
  isSidebarCollapsed = false;
  isFullscreen = false;

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
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
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.document.fullscreenElement) {
      this.document.exitFullscreen?.();
    }
  }
}
