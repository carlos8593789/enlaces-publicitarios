# Enlaces Publicitarios - Frontend Angular

Aplicacion Angular para la operacion de Enlaces Publicitarios, con autenticacion JWT, layouts por rol y modulos para flujo administrativo y lectura/entrega por QR.

## Tecnologias

- Angular 17 (standalone components)
- TypeScript 5
- Bootstrap 5
- RxJS
- ZXing (`@zxing/browser`) para lectura de QR

## Control de cambios

El historial de cambios de la aplicacion se mantiene en `CHANGELOG.md`.

- Version actual: `1.0.0`
- Ultima actualizacion del changelog: `2026-06-28`

Revisa el detalle completo aqui:

- `CHANGELOG.md`

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Inicio rapido

1. Instala dependencias:

```bash
npm install
```

2. Inicia el servidor de desarrollo:

```bash
npm run start
```

3. Abre la aplicacion:

http://localhost:4200/

## Scripts disponibles

| Script | Descripcion |
| --- | --- |
| `npm run start` | Levanta la app en modo desarrollo (`ng serve`). |
| `npm run start:qa` | Levanta la app usando configuracion `qa`. |
| `npm run build` | Genera build de produccion. |
| `npm run build:qa` | Genera build con configuracion `qa`. |
| `npm run watch` | Build incremental para desarrollo. |
| `npm run test` | Ejecuta pruebas unitarias con Karma/Jasmine. |

## Entornos

Los entornos se configuran en `src/environments`:

- `environment.ts` (local)
	- `apiBaseUrl`: `http://127.0.0.1:8000`
	- `apiEnlacesUrl`: `http://localhost/enlacespublicitarios`
- `environment.qa.ts` (QA)
	- `apiBaseUrl`: `https://api.desarrolloenlaces.com`
	- `apiEnlacesUrl`: `https://desarrolloenlaces.com`
- `environment.prod.ts` (produccion)
	- `apiBaseUrl`: `https://api.enlacespublicitarios.com.mx`
	- `apiEnlacesUrl`: `https://enlacespublicitarios.com.mx`

## Arquitectura general

### Rutas y seguridad

- Las rutas estan definidas en `src/app/app.routes.ts`.
- Se utiliza `authGuard` para proteger rutas autenticadas.
- Se utiliza `roleGuard` para validar acceso por rol.
- Layouts principales:
	- `admin` para panel administrativo.
	- `qr` para flujo de lectura/entrega.

### Autenticacion

- El login se implementa en `src/app/auth/login.component.ts`.
- El servicio `src/app/auth/auth.service.ts` consume `POST /api/auth/login`.
- El token, rol y expiracion se guardan en `localStorage`.
- El interceptor de auth agrega token a peticiones HTTP autenticadas.

### Estructura del proyecto

```text
src/
	app/
		auth/          # login, guards, interceptor, auth service
		layouts/       # layouts por rol (admin y qr)
		pages/         # vistas de negocio (admin y qr)
		services/      # servicios de datos
		models/        # modelos tipados
		shared/        # componentes compartidos
	environments/    # configuraciones por ambiente
```

## Flujo de trabajo recomendado

1. Crear nueva vista dentro de `src/app/pages` segun el dominio (`admin` o `qr`).
2. Registrar la ruta hija correspondiente en `src/app/app.routes.ts`.
3. Si requiere seguridad, asegurar guardas (`authGuard`, `roleGuard`).
4. Centralizar llamadas API en `src/app/services`.
5. Mantener modelos en `src/app/models` para tipado consistente.

## Build y despliegue

- Build produccion:

```bash
npm run build
```

- Build QA:

```bash
npm run build:qa
```

Los artefactos se generan en `dist/`.

## Testing

Para ejecutar pruebas unitarias:

```bash
npm run test
```

## Notas

- Bootstrap se importa globalmente desde `src/styles.scss`.
- El proyecto usa componentes standalone (sin `NgModule` para componentes/paginas nuevas).
