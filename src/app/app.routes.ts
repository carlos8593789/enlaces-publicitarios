import { Routes } from '@angular/router';

import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { LoginComponent } from './auth/login.component';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { ClientLayoutComponent } from './layouts/client/client-layout.component';
import { ClienteHomeComponent } from './pages/cliente-home.component';
import { ClienteQrProcesarComponent } from './pages/cliente-qr-procesar.component';
import { DashboardComponent } from './pages/dashboard.component';
import { PizarraRemisionesComponent } from './pages/pizarra-remisiones/pizarra-remisiones.component';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{
		path: 'admin',
		component: AdminLayoutComponent,
		canActivate: [authGuard, roleGuard],
		data: { role: 'admin' },
		children: [
			{ path: 'dashboard', component: DashboardComponent },
			{ path: 'pizarra-remisiones', component: PizarraRemisionesComponent },
			{ path: '', pathMatch: 'full', redirectTo: 'pizarra-remisiones' }
		]
	},
	{
		path: 'app',
		component: ClientLayoutComponent,
		canActivate: [authGuard, roleGuard],
		data: { role: 'admin' },
		children: [
			{ path: 'leer-qr', component: ClienteHomeComponent },
			{ path: 'entregar', component: ClienteQrProcesarComponent },
			{ path: '', pathMatch: 'full', redirectTo: 'leer-qr' }
		]
	},
	{ path: '', pathMatch: 'full', redirectTo: 'admin' },
	{ path: '**', redirectTo: '' }
];
