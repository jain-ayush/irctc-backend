# IRCTC backend microservices

This repository contains four independently deployable Node.js services at
the repository root:

| Service | Local port | Responsibility |
| --- | ---: | --- |
| User | 3001 | User profiles and accounts |
| Booking | 3002 | Reservations and booking lifecycle |
| Payment | 3003 | Payment orchestration and provider integration |
| Search | 3004 | Search queries and indexing |

Each service has its own `package.json`, `node_modules`, `.env`, `.gitignore`,
Dockerfile, and `src` folders for configuration, controllers, middleware,
services, and utilities. The apps are isolated starter scaffolds: persistence,
inter-service business flows, and external provider integrations are not
configured.

## Run locally

Install dependencies separately so each service gets its own `node_modules`:

```sh
npm install --prefix user-service
npm install --prefix booking-service
npm install --prefix payment-service
npm install --prefix search-service
```

Start one service with its root script, for example `npm run dev:user`, or run
all four containers with:

```sh
docker compose up --build
```

The service health endpoints are `/health`; `/api` returns the service's
responsibility metadata. The `.env.example` files document local settings;
`.env` files are ignored by Git and contain only development values.
