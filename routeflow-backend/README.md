# RouteFlow Backend

Laravel REST API for **RouteFlow**, a logistics and delivery management platform.

## Tech Stack

* Laravel
* PHP
* PostgreSQL
* Redis
* Laravel Sanctum
* Eloquent ORM

## Features

* Authentication & authorization
* Organization management
* Customer management
* Order management
* Warehouse & inventory management
* Shipment management
* Driver & vehicle management
* Delivery management
* Proof of delivery
* Delivery failure & rescheduling
* Notifications
* Audit logs
* Dashboard & analytics APIs

## Architecture

The backend follows a modular monolith architecture with:

* Controllers for HTTP handling
* Form Requests for validation
* Policies for authorization
* Actions/Services for business logic
* Eloquent models for data access
* API Resources for consistent responses
* Events and Jobs for background operations

## API

API endpoints are versioned under:

```text
/api/v1
```

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Configure PostgreSQL and Redis in `.env` before running the application.

## Testing

```bash
php artisan test
```

Code style:

```bash
vendor/bin/pint --test
```

