## Purpose

This file gives concise, actionable context for AI coding agents working on this repository so they can be immediately productive. It documents the architecture, conventions, workflows, and concrete examples from the codebase.

**Big picture**
- **Stack:** Angular application generated with Angular CLI (v21). Code uses modern bootstrap (standalone-style) in `src/main.ts` plus an `AppModule` for compatibility.
- **Entrypoints:** `src/main.ts` bootstraps `App` with `src/app/app.config.ts` (`provideRouter(routes)`), while `src/app/app.module.ts` still registers global providers (HTTP interceptors) and standalone components.
- **Features / boundaries:** Feature modules live under `src/app/features/*` (e.g. `inventory`, `auth`, `purchases`, `sales`). Shared UI and utilities are in `src/app/shared` / `src/shared`.

**Where to look first (quick map)**
- Routing & app bootstrap: `src/main.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts`
- App module & global providers: `src/app/app.module.ts` (interceptors registered here)
- Authentication: `src/app/core/auth/auth.service.ts` and `src/app/core/interceptors/jwt.interceptor.ts`
- HTTP services & API patterns: `src/app/core/services/*` (example: `product.service.ts` uses `environment.apiUrl` and standard REST endpoints like `/produits`)
- Feature examples: `src/app/features/inventory/inventory.module.ts`, `src/app/features/auth/auth.module.ts`
- Shared utilities: `src/shared/*` and `src/app/shared/shared.module.ts`

**Key conventions & patterns (concrete, repo-specific)**
- API base URL: built from `environment.apiUrl` in `src/environments/environment.ts` (services append resource paths, e.g. `${environment.apiUrl}/produits`).
- Token storage: auth token is stored in `localStorage` key `token` and the user object (JSON) in `user`. Interceptors read `localStorage.getItem('token')` to add `Authorization: Bearer ...` for requests to `environment.apiUrl`.
- Service style: Services use `HttpClient` with typed methods (`getAll(page, limit, search)`, `getOne(id)`, `create`, `update`, `delete`) and `HttpParams` for pagination/filters. Follow `ProductService` as canonical example.
- Models & naming: many models and types use French names (`Produit`, `Utilisateur`, endpoints like `/produits`). Look under `src/shared/models/*.model.ts` for existing shapes.
- Reactive state: `AuthService` exposes a `BehaviorSubject` (`currentUserSubject`) and `currentUser$` observable — prefer updating state through the service to keep UI in sync.
- Directives & shared helpers: `SharedModule` exposes form helpers and `IfPremiumDirective` used across features; import `SharedModule` in feature modules.

**Routing / bootstrap notes**
- This repo mixes a modern `bootstrapApplication` approach (`src/main.ts` + `appConfig`) and an `NgModule` (`AppModule`). When adding new global providers (interceptors) or bootstrapped providers, prefer registering them in `AppModule.providers` if they must be global for the current codebase; otherwise, use `appConfig.providers` when creating a new standalone-style feature.
- Routes are provided from `src/app/app.routes.ts` — add feature routes there or in feature routing modules (`InventoryRoutingModule`) as appropriate (lazy-load feature modules when possible).

**Development & testing workflow (from README)**
- Start dev server: `ng serve` (default host `http://localhost:4200/`).
- Build: `ng build` (artifacts -> `dist/`).
- Unit tests: `ng test` (Vitest configured).
- E2E: `ng e2e` (no specific e2e framework committed; add if needed).

**Practical examples for common tasks**
- Add a new REST endpoint helper: create `src/app/core/services/<resource>.service.ts` following `ProductService` (use `environment.apiUrl`, `HttpParams` for filters/pagination).
- Add authentication-protected requests: rely on `jwt.interceptor.ts` which attaches `Authorization` header for requests to `environment.apiUrl`. If you need to change token handling, update both `AuthService` (storage and `currentUser$`) and `JwtInterceptor`.
- Add a new page in a feature module: update feature's routing module (e.g., `inventory-routing.module.ts`), add the component under `src/app/features/<feature>/pages`, and import `SharedModule` to reuse forms/directives.
- Register global HTTP interceptors: add them in `src/app/app.module.ts` providers array using `{ provide: HTTP_INTERCEPTORS, useClass: XInterceptor, multi: true }` (existing pattern).

**Agent guidance / behavior preferences**
- Be conservative: prefer following existing file and naming conventions (French model names, REST resource names) rather than renaming.
- When editing authentication or API code, update and run unit tests (`ng test`) to verify behavior; keep `environment.apiUrl` usage consistent.
- Where both standalone bootstrap and `NgModule` approaches appear, do not remove the other without explicit developer instruction — they coexist by design here.

**Files to reference when editing or adding features**
- `src/main.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts`
- `src/app/app.module.ts` (global providers/interceptors)
- `src/app/core/auth/auth.service.ts`, `src/app/core/interceptors/jwt.interceptor.ts`
- `src/app/core/services/product.service.ts` (canonical service)
- `src/shared/models/*.model.ts` and `src/app/shared/shared.module.ts`

If anything above is unclear or you want the file reorganized (for instance to fully migrate to standalone bootstrap), tell me which parts to expand or change and I will update this guidance accordingly.

---
Generated by AI assistant based on repository contents on December 8, 2025.
