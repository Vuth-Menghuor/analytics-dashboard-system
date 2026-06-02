# CCUN Insights Backend

Laravel API for the CCUN Insights analytics dashboard. It provides authentication and Moodle-derived dashboard endpoints for students, courses, reports, and role-based analytics pages.

## Stack

- PHP 8.3
- Laravel 13
- Laravel Sanctum
- PostgreSQL-compatible analytics queries

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

Update `.env` with the database connection used by the analytics tables/views.

## Development

```bash
php artisan serve
```

Run tests:

```bash
php artisan test
```

Format PHP code:

```bash
./vendor/bin/pint
```

## Notes

- Do not commit generated files from `bootstrap/cache` or `storage`.
- API examples are kept in `../projecti5-api-collection`.
