# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# HR Management System

## Stack
Backend:  .NET 8 Web API + Clean Architecture
Frontend: Angular 17 + Angular Material + Tailwind CSS
Database: PostgreSQL + Entity Framework Core
Auth:     JWT Bearer Tokens with role-based claims

## Roles
Admin, HR, Manager, Employee

## Key Packages
- **Backend:** iTextSharp (PDF generation), MailKit (Email sending)
- **Frontend:** Chart.js (Charts/Analytics), Angular CDK DragDrop (Kanban boards)

## Backend Naming Conventions (.NET / C#)
Classes, Methods, Properties  → PascalCase        e.g. EmployeeService
Variables, Parameters         → camelCase          e.g. employeeId
Private Fields                → _camelCase         e.g. _employeeName
Interfaces                    → I + PascalCase     e.g. IEmployeeRepository
Constants                     → UPPER_SNAKE_CASE   e.g. MAX_LEAVES_PER_YEAR
DTOs                          → Name + Dto         e.g. EmployeeDto
Controllers                   → Name + Controller  e.g. EmployeeController
DB Tables                     → PascalCase plural  e.g. Employees
DB Columns                    → PascalCase         e.g. EmployeeCode

## Frontend Naming Conventions (Angular / TypeScript)
Component selectors  → kebab-case          e.g. app-employee-list
Files                → kebab-case           e.g. employee-list.component.ts
Classes, Services    → PascalCase           e.g. EmployeeService
Variables            → camelCase            e.g. employeeList
Observables          → camelCase + $        e.g. employees$
Constants            → UPPER_SNAKE_CASE     e.g. API_BASE_URL
Interfaces           → PascalCase, no I     e.g. Employee (not IEmployee)

## General Rules (Both)
No magic numbers     → use named constants or enums
No logic in controllers or components → services only
Max function length  → 30 lines, split if longer
No commented-out code → delete it, use Git history
Async methods        → always use async/await
One class per file   → filename must match class name

## Architecture Rules
Repository pattern + Service layer in backend always
All endpoints must have [Authorize] unless explicitly public
Use AutoMapper for all DTO mappings — no manual mapping
Angular: feature modules with lazy loading, reactive forms only

## Project Structure (Clean Architecture)

### Backend (/backend)
```
/backend
  HRManagement.sln
  /src
    /HRManagement.API          → Controllers, Middleware, Program.cs
    /HRManagement.Application  → Services, DTOs, Interfaces, Validators
    /HRManagement.Domain       → Entities, Enums
    /HRManagement.Infrastructure → DbContext, Repositories, Email, PDF
  /tests
    /HRManagement.Tests        → Unit and integration tests
```

### Frontend (/frontend)
```
/frontend
  /src/app
    /core       → Guards, Interceptors, Auth Service
    /shared     → Reusable Components, Pipes, Directives
    /models     → TypeScript interfaces matching backend DTOs
    /features
      /auth
        /login
        /register
        /forgot-password
      /employees
        /list
        /detail
        /add-edit
      /departments
        /list
        /add-edit
      /attendance
        /calendar
        /team-view
        /check-in
      /leave
        /apply
        /approvals
        /balance
      /payroll
        /generate
        /payslips
        /download
      /recruitment
        /jobs
        /applicant-pipeline
      /performance
        /reviews
        /ratings
      /training
        /trainings
        /assignments
      /assets
        /asset-list
        /assign-return
      /documents
        /upload
        /view-per-employee
```

## Common Commands

### Backend (.NET)
```bash
# Navigate to backend
cd backend

# Run API (Development)
dotnet run --project src/HRManagement.API
# API runs on: http://localhost:5284 (HTTP) and https://localhost:7052 (HTTPS)
# Swagger UI: http://localhost:5284/swagger

# Run with specific configuration
dotnet run --project src/HRManagement.API --configuration Release

# Watch mode (auto-rebuild on changes)
dotnet watch --project src/HRManagement.API

# Run tests
dotnet test

# Run specific test
dotnet test --filter "FullyQualifiedName~TestClassName.TestMethodName"

# Add migration
dotnet ef migrations add <MigrationName> --project src/HRManagement.Infrastructure --startup-project src/HRManagement.API

# Update database
dotnet ef database update --project src/HRManagement.Infrastructure --startup-project src/HRManagement.API

# Remove last migration (if not applied)
dotnet ef migrations remove --project src/HRManagement.Infrastructure --startup-project src/HRManagement.API

# Build solution
dotnet build

# Clean solution
dotnet clean
```

### Frontend (Angular)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run dev server (with proxy to backend)
npm start  # or ng serve
# Runs on http://localhost:4200 with API proxy to http://localhost:5284

# Run without proxy
ng serve --no-proxy

# Watch mode (auto-rebuild)
npm run watch  # or ng build --watch --configuration development

# Build for production
npm run build  # or ng build --configuration production

# Run tests
npm test  # or ng test

# Run tests in headless mode
ng test --watch=false --browsers=ChromeHeadless

# Generate new component
ng generate component features/<module>/<component-name>
# Example: ng generate component features/employees/employee-list

# Generate new service
ng generate service core/services/<service-name>

# Lint
npm run lint  # or ng lint
```

### Running Both Together (Development)
```bash
# Terminal 1 - Backend
cd backend && dotnet run --project src/HRManagement.API

# Terminal 2 - Frontend
cd frontend && npm start
```

## Configuration

### Backend
- **Connection String:** Update in `backend/src/HRManagement.API/appsettings.json` and `appsettings.Development.json`
- **JWT Secret:** Change in `appsettings.json` before deployment (JwtSettings:Secret)
- **API URLs:** Configured in `Properties/launchSettings.json` (http://localhost:5284, https://localhost:7052)

### Frontend
- **API Base URL:** Configure in `frontend/src/environments/environment.ts` (currently: http://localhost:5284/api)
- **Production URL:** Configure in `frontend/src/environments/environment.prod.ts`
- **Proxy Config:** API proxy settings in `frontend/proxy.conf.json`

## Authentication Flow
- Login → JWT token with role claims (Admin, HR, Manager, Employee)
- All requests include Authorization: Bearer <token>
- API validates JWT and checks role-based permissions via [Authorize(Roles = "...")]

## Database Relationships (Key Entities)
- Employee → Department (Many-to-One)
- Employee → LeaveRequest (One-to-Many)
- Employee → Payroll (One-to-Many)
- Department → Employee (One-to-Many, head is also Employee)

## How to Start Each Session
Run /init first — Claude Code will read this file
Say: "Follow our CLAUDE.md conventions for all code"
