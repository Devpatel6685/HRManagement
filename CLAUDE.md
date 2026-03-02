# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# HR Management System

## Stack
- Backend:  .NET 8 Web API + Clean Architecture
- Frontend: Angular 17 standalone components + Angular Material + Tailwind CSS
- Database: PostgreSQL 192.168.0.222:5432 / `HRManagementDB` / `postgres:postgres`
- Auth:     JWT Bearer (HS256, 60 min) + RefreshToken rotation stored in DB (7 days)

## Roles
`Admin`, `HR`, `Manager`, `Employee`

---

## Common Commands

### Backend (run from `/backend`)

```bash
# Run API — CORRECT path (folder is src/API, not src/HRManagement.API)
dotnet run --project src/API/HRManagement.API.csproj
# HTTP: http://localhost:5284  |  Swagger: http://localhost:5284/swagger

# If server is running and DLLs are locked, build only the Application layer to check errors
dotnet build src/Application/HRManagement.Application.csproj

# Stop the running server on Windows before migrations or full builds
powershell -Command "Get-Process dotnet -ErrorAction SilentlyContinue | Stop-Process -Force"

# EF Core migrations — CORRECT paths
dotnet ef migrations add <Name>  --project src/Infrastructure --startup-project src/API
dotnet ef database update        --project src/Infrastructure --startup-project src/API
dotnet ef migrations remove      --project src/Infrastructure --startup-project src/API
```

### Frontend (run from `/frontend`)

```bash
npm start          # ng serve with proxy → http://localhost:4200
npm run build      # production build
npm run lint       # ng lint
npm test           # ng test (Karma)
ng test --watch=false --browsers=ChromeHeadless
```

---

## Backend Architecture

### Folder Names (actual on disk)
```
backend/src/
  API/            → Controllers, Middleware, Program.cs
  Application/    → Services, DTOs, Interfaces, Mappings
  Domain/         → Entities, Enums, Common/BaseEntity
  Infrastructure/ → ApplicationDbContext, Configurations, Migrations, Repositories, Services
```

### Two Service Patterns in use

| Pattern | Used for | DTO mapping |
|---|---|---|
| `IApplicationDbContext` + inline `.Select()` LINQ | Department, Designation, Auth | Manual / inline projection |
| `IEmployeeRepository` + AutoMapper | Employee | `EmployeeMappingProfile` |

> **Rule override:** The "Use AutoMapper for everything" rule does NOT apply to Department, Designation, or Auth — they all use manual mapping. Only Employee uses AutoMapper.

### ExceptionMiddleware → HTTP mapping
| Exception | HTTP |
|---|---|
| `KeyNotFoundException` | 404 |
| `InvalidOperationException` | 400 |
| `ArgumentException` | 400 |
| `UnauthorizedAccessException` | 401 |

Response body is always `{ "error": "message" }`. Frontend reads `err?.error?.error`.

### ApplicationDbContext
- `UpdateAuditFields()` in `SaveChangesAsync` auto-sets `CreatedAt` (Added) and `UpdatedAt` (Modified) on all `BaseEntity` subclasses — never set these manually.
- All entity EF configurations live in `Infrastructure/Configurations/` and are loaded via `ApplyConfigurationsFromAssembly`.

### DataSeeder (runs on every startup, idempotent)
Seeds on first run: Roles, Departments (Engineering/HR/Finance), Designations, LeaveTypes (Annual 15d / Sick 10d / Casual 7d), Admin user.
- Default admin: `admin@hrms.com` / `Admin@123`

### Migration History
1. `InitialCreate` — all 17 entities, Guid PKs
2. `AddRefreshTokensAndPasswordReset` — RefreshTokens table, PasswordResetToken/Expiry on Users
3. `AddAttendanceLeaveChanges` — WorkHours on Attendances, TotalDays+ApprovedAt on LeaveRequests, RemainingDays (generated stored column) on LeaveBalances

### Key Entity Notes
- `Employee.Status`: Active, Inactive, OnLeave, Terminated
- `Attendance.WorkHours`: `numeric(5,2)`, nullable
- `LeaveBalance.RemainingDays`: PostgreSQL `GENERATED ALWAYS AS (TotalDays - UsedDays) STORED` — never set it manually
- `Designation.Level`: 1–5 (1=Junior → 5=Manager), validated in `DesignationService`
- All PKs are `Guid`

### Auth Flow
- `POST /api/auth/login` → returns `{ accessToken, refreshToken, expiresAt, user }`
- `POST /api/auth/refresh-token` → rotates token (revokes old, issues new)
- `POST /api/auth/logout` → revokes all active refresh tokens for user
- JWT key in appsettings: `JwtSettings:SecretKey`

---

## Frontend Architecture

### Core Wiring
- `jwtInterceptor` — automatically injects `Authorization: Bearer <token>` on every request
- `errorInterceptor` — global HTTP error handler
- `authGuard` — redirects unauthenticated users to `/auth/login`
- `roleGuard` — checks `data.roles` against the JWT claim, redirects to `/forbidden`
- Tokens stored in `localStorage` as `hr_access_token` / `hr_refresh_token`
- `AuthService.currentUser$` — `BehaviorSubject<User | null>` decoded from JWT via `jwtDecode`

### Feature Routing
All protected routes are children of `MainLayoutComponent` (which renders sidebar + topbar). Each feature folder has a `<feature>.routes.ts` with lazy-loaded `loadComponent`.

### Date Handling Rules (important — bugs already fixed)
- `<input type="date">` **always** gives the form control a plain `string` (`"YYYY-MM-DD"`), never a `Date` object.
- When patching a form for edit, pass the string directly — do NOT convert to `new Date(...)`.
- When displaying with Angular date pipe, use `value + 'T00:00:00' | date:'MMM d, y'` (appending local midnight) to avoid timezone off-by-one on UTC+ systems. Do not use `| date:'..':'UTC'` for date-only values.
- The `fmtDate(d)` helper in components accepts `Date | string | null`.

### Naming & Patterns
- All components are standalone (no NgModules)
- Reactive forms only (`FormBuilder`, `Validators`)
- Services injected via constructor DI
- Error display: `err?.error?.error` (matches ExceptionMiddleware response shape)
- Confirm delete always uses `ConfirmDialogComponent` from `shared/components/confirm-dialog`
- Role checks: `authService.hasRole('Admin')` / `authService.hasAnyRole(['Admin', 'HR'])`

---

## Configuration Files
| File | Purpose |
|---|---|
| `backend/src/API/appsettings.json` | Connection string, JWT settings, SMTP |
| `backend/src/API/Properties/launchSettings.json` | HTTP/HTTPS ports |
| `frontend/src/environments/environment.ts` | `apiBaseUrl: http://localhost:5284/api` |
| `frontend/proxy.conf.json` | Dev proxy: `/api/*` → `http://localhost:5284` |
