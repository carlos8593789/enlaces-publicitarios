# Instrucciones de Copilot

Proyecto Angular con componentes standalone y layout tipo panel administrativo.

## Arquitectura

- Rutas en [src/app/app.routes.ts](src/app/app.routes.ts). Hay layouts separados para `admin` y `cliente` con `authGuard` + `roleGuard`.
- Layouts en [src/app/layouts](src/app/layouts): `admin` y `client` con header/sidebar/footer propios.
- Autenticación en [src/app/auth](src/app/auth): `AuthService` guarda JWT simulado en `localStorage` y `LoginComponent` maneja el acceso.
- Vistas del panel en [src/app/pages](src/app/pages), con `Dashboard` como ejemplo.
- Bootstrap se importa globalmente en [src/styles.scss](src/styles.scss).

## Flujos de trabajo

- `npm run start` (dev server)
- `npm run build` (build)
- `npm run test` (tests)

## Convenciones del proyecto

- Nuevas vistas: crear en [src/app/pages](src/app/pages) y registrar rutas hijas del layout.
- Componentes de layout: mantener en [src/app/layouts](src/app/layouts) según el rol.
- Cambios de autenticación: centralizar en `AuthService` y `authGuard`.
