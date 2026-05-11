# Reliable Node Service

A containerized Node.js incident-management API built for SRE and cloud infrastructure practice. The service uses Express, MySQL, Docker Compose, health/readiness checks, structured JSON logging, and automated tests.

## Why This Project Exists

Site Reliability Engineering is about keeping services available, observable, and easy to troubleshoot. This project demonstrates those ideas in a small production-style API:

- REST service with persistent MySQL storage
- `/health` endpoint for liveness checks
- `/ready` endpoint for database readiness checks
- Incident CRUD API backed by MySQL
- Structured JSON logs for debugging
- Docker Compose environment for reproducible local infrastructure
- Automated API tests with Jest and Supertest

## Architecture

```text
Client / curl / API consumer
        |
        v
Node.js Express API
  |-- GET    /health
  |-- GET    /ready
  |-- GET    /incidents
  |-- POST   /incidents
  |-- PATCH  /incidents/:id
  |-- DELETE /incidents/:id
        |
        v
MySQL 8 Docker container
```

## Tech Stack

- Node.js
- Express
- MySQL
- Docker Compose
- dotenv
- pino / pino-http
- Jest
- Supertest

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness check: confirms the Node.js app is running |
| `GET` | `/ready` | Readiness check: confirms MySQL is reachable |
| `GET` | `/incidents` | List incidents |
| `GET` | `/incidents/:id` | Get one incident |
| `POST` | `/incidents` | Create an incident |
| `PATCH` | `/incidents/:id` | Update an incident |
| `DELETE` | `/incidents/:id` | Delete an incident |

## Incident Data Model

Example incident:

```json
{
  "service_name": "payment-api",
  "severity": "high",
  "status": "investigating",
  "description": "Database latency is above normal threshold"
}
```

Allowed severities:

```text
low, medium, high, critical
```

Allowed statuses:

```text
open, investigating, resolved
```

## Setup

Clone the repository:

```bash
git clone https://github.com/madinasagatova/reliable-node-service.git
cd reliable-node-service
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

If your Docker MySQL port is mapped to `3307`, use:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password
MYSQL_DATABASE=incident_service
```

## Run MySQL With Docker Compose

Start MySQL:

```bash
docker compose up -d
```

Check that the container is healthy:

```bash
docker compose ps
```

Expected:

```text
reliable-node-mysql   mysql:8.4   Up ... (healthy)
```

If port `3306` is already used on your machine, map MySQL to `3307` in `docker-compose.yml`:

```yaml
ports:
  - "3307:3306"
```

## Initialize the Database

Run the migration:

```bash
npm run db:init
```

This creates the `incidents` table if it does not already exist.

## Run the API

```bash
npm run dev
```

The API runs on:

```text
http://localhost:3000
```

## Health and Readiness Checks

Check liveness:

```bash
curl http://localhost:3000/health
```

Expected:

```json
{"status":"ok","service":"reliable-node-service"}
```

Check readiness:

```bash
curl http://localhost:3000/ready
```

Expected:

```json
{"status":"ready","dependencies":{"mysql":"ok"}}
```

## API Examples

Create an incident:

```bash
curl -X POST http://localhost:3000/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "payment-api",
    "severity": "high",
    "status": "investigating",
    "description": "Database latency is above normal threshold"
  }'
```

List incidents:

```bash
curl http://localhost:3000/incidents
```

Get one incident:

```bash
curl http://localhost:3000/incidents/1
```

Update an incident:

```bash
curl -X PATCH http://localhost:3000/incidents/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"resolved"}'
```

Delete an incident:

```bash
curl -X DELETE http://localhost:3000/incidents/1
```

## Tests

Run automated tests:

```bash
npm test
```

The tests use Jest and Supertest to verify health checks, readiness behavior, validation, and incident API routes.

## Reliability Features

- **Liveness check:** `/health` confirms the Node.js process is running.
- **Readiness check:** `/ready` confirms the MySQL dependency is reachable.
- **Dockerized database:** MySQL runs consistently through Docker Compose.
- **Structured logging:** pino logs requests and errors in JSON format.
- **Database connection pool:** MySQL connections are reused efficiently.
- **Database indexes:** incidents are indexed by status, severity, and service name.
- **Central error handling:** API errors return consistent JSON responses.
- **Automated tests:** Jest and Supertest verify core service behavior.

## Useful Docker Commands

Start containers:

```bash
docker compose up -d
```

Check status:

```bash
docker compose ps
```

View MySQL logs:

```bash
docker compose logs mysql
```

Stop containers:

```bash
docker compose down
```

Stop containers and delete database volume:

```bash
docker compose down -v
```

## What I Learned

This project helped me practice backend and infrastructure concepts that are important for SRE/cloud infrastructure roles:

- Building a service with operational endpoints
- Connecting Node.js to MySQL through a connection pool
- Running infrastructure locally with Docker Compose
- Designing readiness checks around service dependencies
- Writing structured logs for troubleshooting
- Testing API behavior automatically

## Resume Bullet

Built a containerized Node.js incident-management API with MySQL, Docker Compose, liveness/readiness checks, structured JSON logging, database connection pooling, and automated API tests to demonstrate service reliability and troubleshooting practices.

## Future Improvements

- Dockerize the Node.js API container as well as MySQL
- Add GitHub Actions CI for automated test runs
- Add Prometheus-style `/metrics`
- Add OpenAPI/Swagger documentation
- Add load testing with `autocannon` or `k6`
