import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './client-sidebar.component.html',
  styleUrl: './client-sidebar.component.scss'
})
export class ClientSidebarComponent {
  @Input() collapsed = false;
}
