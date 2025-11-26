# Invoice Manager

A full-stack invoice management application built with Vue.js, Express.js, TypeScript, and Prisma.

## Features

- Create and manage invoices
- View invoice details
- Generate invoices as PDF
- Modern, responsive UI with Tailwind CSS

## Project Structure

```
invoice-manager/
├── packages/
│   ├── frontend/     # Vue 3 + TypeScript + Vite + Tailwind
│   └── backend/      # Express + TypeScript + Prisma
├── turbo.json        # Turborepo configuration
└── package.json      # Root workspace configuration
```

## Prerequisites

- Node.js (v20 or higher)
- npm (v10 or higher)
- MySQL database

## Setup

### Initial Setup

1. Install all dependencies from the root:
```bash
npm install
```

2. Set up backend environment:
   - Navigate to `packages/backend/`
   - Create a `.env` file (copy from `.env.example` if available)
   - Update the `.env` file with your database connection string:
   ```
   DATABASE_URL="mysql://user:password@localhost:3306/invoice_manager"
   PORT=5000
   ```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

**Note:** After updating the Prisma schema, always run `prisma:generate` to regenerate the Prisma client with updated types.

### Development

Start both frontend and backend in development mode:
```bash
npm run dev
```

Or run them individually:
```bash
npm run dev:frontend  # Frontend only (http://localhost:3000)
npm run dev:backend   # Backend only (http://localhost:5000)
```

### Building

Build all packages:
```bash
npm run build
```

Or build individually:
```bash
npm run build:frontend
npm run build:backend
```

## API Endpoints

- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create a new invoice
- `PUT /api/invoices/:id` - Update an invoice
- `DELETE /api/invoices/:id` - Delete an invoice
- `GET /api/invoices/:id/pdf` - Generate PDF for an invoice

## Technologies Used

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Vite
- Tailwind CSS
- Vue Router
- Pinia
- Axios

### Backend
- Express.js
- TypeScript
- Prisma ORM
- MySQL
- PDFKit (for PDF generation)

### Build System
- Turborepo - Monorepo build system with intelligent caching

## Available Commands

All commands are run from the root directory using Turborepo:

### Development
- `npm run dev` - Run both frontend and backend in development mode
- `npm run dev:frontend` - Run only frontend
- `npm run dev:backend` - Run only backend

### Building
- `npm run build` - Build all packages
- `npm run build:frontend` - Build frontend only
- `npm run build:backend` - Build backend only

### Linting
- `npm run lint` - Lint all packages

### Prisma
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Turborepo

This project uses [Turborepo](https://turborepo.com/) for build orchestration and caching. Turborepo provides:

- **Intelligent caching** - Builds are cached and reused when inputs haven't changed
- **Parallel execution** - Tasks run in parallel when possible
- **Task dependencies** - Automatic dependency management between packages
- **Fast builds** - Only rebuild what changed

The configuration is in `turbo.json`. To clear the cache:
```bash
turbo run build --force
```

## Docker

This project includes Dockerfiles for both frontend and backend services.

### Build Docker Images

```bash
# Build backend image
docker build -f packages/backend/Dockerfile -t invoice-manager-backend:latest .

# Build frontend image
docker build -f packages/frontend/Dockerfile -t invoice-manager-frontend:latest .
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Make sure to set the `DATABASE_URL` environment variable in `docker-compose.yml` or create a `.env` file.

## CI/CD

This project includes GitHub Actions workflows for automated Docker image building and deployment to DigitalOcean.

### Features

- **Automatic Docker builds** - Builds images on every push
- **Multi-registry support** - Docker Hub or DigitalOcean Container Registry
- **Automatic deployment** - Deploys to DigitalOcean App Platform or Droplet

### Deployment Options

1. **DigitalOcean App Platform** (Recommended) - Managed platform with automatic scaling
2. **DigitalOcean Droplet** - Self-managed VPS deployment with Docker

See [`.github/workflows/README.md`](.github/workflows/README.md) for detailed setup instructions.

### Quick Setup

1. Configure Docker registry secrets in GitHub:
   - `DOCKER_USERNAME` and `DOCKER_PASSWORD` (for Docker Hub)
   - Or `DIGITALOCEAN_ACCESS_TOKEN` (for DigitalOcean Container Registry)
   - `DOCKER_REGISTRY` and `DOCKER_IMAGE_PREFIX`
2. Configure deployment secrets (App Platform or Droplet)
3. Push to `main` branch to trigger automatic build and deployment

## License

MIT

