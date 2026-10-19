# CCUN Insights

CCUN Insights is a full-stack education analytics dashboard that turns Moodle-derived data into clear, role-based reporting for students, courses, institutions, and learning activity.

Built for managers, partner institutions, and visitors, the platform provides interactive analytics, secure access controls, and administration workflows in one application.

## Highlights

- Explore student demographics, enrollment, locations, departments, gender distribution, and engagement.
- Review courses, popular-course rankings, views, and learning activity.
- Compare institutional performance, enrollment, and department coverage.
- Filter, search, paginate, inspect detail drawers, and export data to CSV.
- Support three user roles: **manager**, **partner**, and **visitor**.
- Manage users and partner access requests from an administrative workspace.
- Use the interface in English or Khmer, with responsive and dark-theme support.

## Architecture

```text
Nuxt 4 + Vue 3 frontend
        │
        │ REST API (Axios)
        ▼
Laravel 13 API + Sanctum authentication
        │
        ├── Analytics services and institution-level access controls
        ▼
PostgreSQL-compatible Moodle analytics data
```

The frontend is organized by feature with reusable components, composables, typed contracts, API services, and Pinia stores. The backend separates HTTP controllers from analytics service classes for student, course, institute, summary, and activity reporting.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | Nuxt 4, Vue 3, TypeScript, Pinia, Nuxt UI, Axios |
| Data visualization | Apache ECharts |
| Backend | PHP 8.3, Laravel 13, Laravel Sanctum |
| Database | PostgreSQL-compatible analytics queries with Moodle-derived data |
| Internationalization | `@nuxtjs/i18n` — English and Khmer |
| Quality | PHPUnit, Vitest, Vue Test Utils, ESLint, Vue TSC, Laravel Pint |
| CI | GitHub Actions |
| API testing | Bruno |

## Project Structure

```text
.
├── backend/                    # Laravel API and analytics services
├── frontend/nuxt-app/          # Nuxt/Vue dashboard application
├── projecti5-api-collection/   # Bruno API collection
├── diagrams/                   # Architecture, ERD, sequence, and use-case diagrams
└── .github/workflows/          # Continuous-integration workflow
```

## Getting Started

### Prerequisites

- PHP 8.3 and Composer
- Node.js 22+ and npm
- A PostgreSQL-compatible database containing the required Moodle analytics data

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

Update `backend/.env` with the application database and analytics database connection details. The API runs at `http://127.0.0.1:8000` by default.

### Frontend

In another terminal:

```bash
cd frontend/nuxt-app
cp .env.example .env
npm install
npm run dev
```

The dashboard runs at `http://localhost:3000` by default. Configure `NUXT_PUBLIC_API_BASE_URL` in `frontend/nuxt-app/.env` if the API uses a different address.

## Testing and Quality Checks

```bash
# Backend
cd backend
./vendor/bin/pint --test
php artisan test

# Frontend
cd frontend/nuxt-app
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions executes these backend and frontend checks on pull requests and selected branches.

## API Collection and Diagrams

- Import `projecti5-api-collection/` into [Bruno](https://www.usebruno.com/) to explore the API.
- View the `diagrams/` directory for the entity-relationship, logical and physical architecture, activity, use-case, and sequence diagrams.

## License

This repository is licensed under the MIT License.
