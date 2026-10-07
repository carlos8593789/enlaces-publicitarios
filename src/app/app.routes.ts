import { Routes } from '@angular/router';

import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./auth/login.component').then((m) => m.LoginComponent) },
	{
		path: 'admin',
		loadComponent: () => import('./layouts/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
		canActivate: [authGuard, roleGuard],
		data: { role: 'admin' },
		children: [
			{ path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard.component').then((m) => m.DashboardComponent) },
			{ path: 'pizarra-remisiones', loadComponent: () => import('./pages/admin/pizarra-remisiones/pizarra-remisiones.component').then((m) => m.PizarraRemisionesComponent) },
			{ path: 'cotizaciones/crear', loadComponent: () => import('./pages/admin/cotizaciones/crear-cotizacion.component').then((m) => m.CrearCotizacionComponent) },
			{ path: 'cotizaciones/:id/editar', loadComponent: () => import('./pages/admin/cotizaciones/crear-cotizacion.component').then((m) => m.CrearCotizacionComponent) },
			{ path: '', pathMatch: 'full', redirectTo: 'pizarra-remisiones' }
		]
	},
	{
		path: 'qr',
		loadComponent: () => import('./layouts/qr/client-layout.component').then((m) => m.ClientLayoutComponent),
		canActivate: [authGuard, roleGuard],
		data: { role: 'admin' },
		children: [
			{ path: 'leer', loadComponent: () => import('./pages/qr/leer/cliente-home.component').then((m) => m.ClienteHomeComponent) },
			{ path: 'entregar', loadComponent: () => import('./pages/qr/entregar/cliente-qr-procesar.component').then((m) => m.ClienteQrProcesarComponent) },
			{ path: '', pathMatch: 'full', redirectTo: 'leer' }
		]
	},
	{ path: '', pathMatch: 'full', redirectTo: 'admin' },
	{ path: '**', redirectTo: '' }
];
