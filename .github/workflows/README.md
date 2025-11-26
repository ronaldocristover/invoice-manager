# GitHub Actions Workflows

## Docker Build and Deployment

This repository includes GitHub Actions workflows for building Docker images and deploying to DigitalOcean.

### Required Secrets

You need to configure the following secrets in your GitHub repository settings:

#### For Docker Registry (Required):
**For Docker Hub:**
- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub password or access token
- `DOCKER_REGISTRY` - Set to `docker.io` (or leave empty for Docker Hub)
- `DOCKER_IMAGE_PREFIX` - Image name prefix (e.g., `yourusername/invoice-manager`)

**For DigitalOcean Container Registry:**
- `DOCKER_REGISTRY` - Set to `registry.digitalocean.com`
- `DIGITALOCEAN_ACCESS_TOKEN` - Your DigitalOcean API token
- `DOCKER_IMAGE_PREFIX` - Your registry name (e.g., `your-registry/invoice-manager`)

#### For App Platform Deployment:
- `DIGITALOCEAN_ACCESS_TOKEN` - Your DigitalOcean API token
- `DIGITALOCEAN_APP_ID` - Your App Platform app ID (if updating existing app)
- `DIGITALOCEAN_REGISTRY` - Your DigitalOcean Container Registry name (if using Docker images)

#### For Droplet Deployment:
- `DROPLET_HOST` - Your Droplet IP address or hostname
- `DROPLET_USER` - SSH username (usually `root`)
- `DROPLET_SSH_KEY` - Private SSH key for authentication
- `DROPLET_PORT` - SSH port (optional, defaults to 22)
- `DATABASE_URL` - Database connection string for backend

### Setup Instructions

#### Docker Images

The workflow automatically builds and pushes Docker images for both frontend and backend on every push to main/master branch.

**Image naming:**
- Backend: `{REGISTRY}/{IMAGE_PREFIX}-backend:latest`
- Frontend: `{REGISTRY}/{IMAGE_PREFIX}-frontend:latest`

**Tags:**
- `latest` - Latest build from main/master branch
- `{branch}-{sha}` - Branch-specific builds
- Semantic version tags (if you push git tags like `v1.0.0`)

#### Option 1: DigitalOcean App Platform with Docker (Recommended)

1. Create a DigitalOcean Container Registry:
   ```bash
   doctl registry create your-registry-name
   ```

2. Create a DigitalOcean API token:
   - Go to https://cloud.digitalocean.com/account/api/tokens
   - Generate a new token with read/write permissions

3. Add secrets to GitHub:
   - `DOCKER_REGISTRY`: `registry.digitalocean.com`
   - `DIGITALOCEAN_ACCESS_TOKEN`: Your API token
   - `DOCKER_IMAGE_PREFIX`: `your-registry-name/invoice-manager`
   - `DIGITALOCEAN_REGISTRY`: `your-registry-name`
   - `DIGITALOCEAN_APP_ID`: (Optional, for updates)

4. Configure the app spec file:
   - Edit `.do/app-docker.yaml` for Docker-based deployment
   - Or use `.do/app.yaml` for source-based deployment
   - Update environment variables and routes as needed

5. Create the App Platform app:
   ```bash
   doctl apps create --spec .do/app-docker.yaml
   ```

#### Option 2: DigitalOcean App Platform (Source-based)

1. Follow the same steps as Option 1, but use `.do/app.yaml` instead
2. The app will build from source instead of using Docker images

#### Option 2: DigitalOcean Droplet

1. Set up a Droplet with Node.js and PM2 (or your preferred process manager)

2. Configure SSH access:
   - Generate an SSH key pair if you don't have one
   - Add your public key to the Droplet
   - Add your private key to GitHub Secrets as `DROPLET_SSH_KEY`

3. Add all required secrets to GitHub:
   - `DROPLET_HOST`
   - `DROPLET_USER`
   - `DROPLET_SSH_KEY`
   - `DROPLET_PORT` (optional)

4. Set up your server:
   - Create deployment directory: `/var/www/invoice-manager`
   - Install Node.js and npm
   - Set up your process manager (PM2, systemd, etc.)
   - Configure your reverse proxy (nginx, etc.)

### Workflow Behavior

- **On Push to main/master**: 
  - Builds Docker images for both frontend and backend
  - Pushes images to the configured registry
  - Deploys to DigitalOcean (if configured)
- **On Pull Request**: Only builds Docker images (doesn't push or deploy)
- **On Tag Push (v*)**: Builds and pushes images with version tags
- **Manual Trigger**: Can be triggered manually from the Actions tab

### Local Development with Docker

You can build and run the Docker images locally:

```bash
# Build images
docker-compose build

# Run services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Notes

- Docker images are built using multi-stage builds for optimal size
- Images are cached using GitHub Actions cache for faster builds
- Supports both Docker Hub and DigitalOcean Container Registry
- Backend image includes Prisma migrations that run on container start
- Frontend uses nginx for serving static files
- Only one deployment method will run (App Platform or Droplet) based on your configuration

