# Backend Deployment Guide

## 🎯 Overview

Backend API is deployed to `demo.pali.rent` using Docker, Nginx, and GitHub Actions for automatic deployment.

## 🏗️ Architecture

- **Server**: Ubuntu with Docker and Nginx
- **Domain**: `demo.pali.rent` (with SSL)
- **Services**: 
  - PostgreSQL 15 (database)
  - Redis 7 (caching)
  - NestJS Backend (API)
- **Registry**: GitHub Container Registry (ghcr.io)

## 📋 Initial Server Setup

### 1. Install Required Software (already completed)

```bash
# Docker and Docker Compose are already installed
docker --version
docker compose version

# Nginx is already installed
nginx -v
```

### 2. Configure Nginx

Create the configuration:

```bash
sudo nano /etc/nginx/sites-available/demo.pali.rent
```

Insert the configuration:

```nginx
upstream backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name demo.pali.rent;

    access_log /var/log/nginx/demo.pali.rent.access.log;
    error_log /var/log/nginx/demo.pali.rent.error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    location /api/health {
        proxy_pass http://backend/api/health;
        access_log off;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    location = /robots.txt {
        add_header Content-Type text/plain;
        return 200 "User-agent: *\nDisallow: /\n";
    }

    client_max_body_size 10M;
}
```

Activate the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/demo.pali.rent /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Install SSL (Let's Encrypt)

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d demo.pali.rent
```

### 4. Create Project Directory

```bash
sudo mkdir -p /var/www/task-manager-service
sudo chown deploy:deploy /var/www/task-manager-service
cd /var/www/task-manager-service
```

### 5. Configure Environment Variables

Create the `.env` file:

```bash
nano /var/www/task-manager-service/.env
```

Content (replace the password):

```bash
POSTGRES_USER=taskmgr
POSTGRES_PASSWORD=your_very_secure_password_here_min_16_chars
POSTGRES_DB=taskmgr

GITHUB_REPOSITORY=projectint/task-manager-service
```

### 6. Download docker-compose.prod.yml

```bash
curl -o docker-compose.prod.yml https://raw.githubusercontent.com/ProjectINT/task-manager-service/main/docker-compose.prod.yml
```

### 7. Download Deployment Script

```bash
curl -o deploy.sh https://raw.githubusercontent.com/ProjectINT/task-manager-service/main/scripts/deploy.sh
chmod +x deploy.sh
```

## 🤖 GitHub Actions (Auto-Deploy)

### Configure Secrets

Secrets are already configured in the GitHub repository:

1. **SERVER_HOST**: `217.151.231.229`
2. **SERVER_USER**: `deploy`
3. **SSH_PRIVATE_KEY**: SSH private key

### Verify Secrets

Go to the repository:
```
https://github.com/ProjectINT/task-manager-service/settings/secrets/actions
```

### Workflow Triggers

Automatic deployment is triggered when:
- Push to `main` branch with changes in:
  - `backend/**`
  - `validation/**`
  - `docker-compose.prod.yml`
  - `.github/workflows/deploy-backend.yml`
- Manual trigger via GitHub Actions UI

## 🚀 Deployment

### Automatic Deployment (recommended)

Simply push to `main`:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

GitHub Actions will automatically:
1. Build Docker image
2. Push to GitHub Container Registry
3. Deploy to server
4. Verify health endpoint

### Manual Deployment on Server

SSH to the server:

```bash
ssh deploy@217.151.231.229
cd /var/www/task-manager-service
./deploy.sh
```

## 🔍 Monitoring and Debugging

### Check Service Status

```bash
cd /var/www/task-manager-service
docker compose -f docker-compose.prod.yml ps
```

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Backend only
docker compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail 100 backend
```

### Check Health Endpoint

```bash
curl http://localhost:3001/api/health
curl https://demo.pali.rent/api/health
```

### View Nginx Logs

```bash
sudo tail -f /var/log/nginx/demo.pali.rent.access.log
sudo tail -f /var/log/nginx/demo.pali.rent.error.log
```

## 🔄 Updates

### Update Application

```bash
cd /var/www/task-manager-service
docker pull ghcr.io/projectint/task-manager-service:latest
docker compose -f docker-compose.prod.yml up -d
```

### Database Migrations

Migrations are applied automatically on container startup via `prisma migrate deploy`.

For manual application:

```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## 🛠️ Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs backend

# Check that PostgreSQL and Redis are healthy
docker compose -f docker-compose.prod.yml ps
```

### 502 Bad Gateway in Nginx

```bash
# Check that backend is listening on 3001
curl http://localhost:3001/api/health

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Database Connection Issues

```bash
# Check .env file
cat .env

# Check PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U taskmgr -d taskmgr -c "SELECT 1;"
```

## 📊 API Endpoints

- **Health Check**: `https://demo.pali.rent/api/health`
- **Tasks**: `https://demo.pali.rent/api/tasks`
- **Counters**: `https://demo.pali.rent/api/tasks/counters`

## 🔐 Security

- ✅ HTTPS with Let's Encrypt (auto-renewal)
- ✅ Nginx reverse proxy
- ✅ Backend accessible only via localhost (127.0.0.1:3001)
- ✅ PostgreSQL and Redis in private Docker network
- ✅ Non-root user in Docker container
- ✅ Security headers in Nginx

## 📝 Notes

- Docker images are stored in GitHub Container Registry (ghcr.io)
- SSL certificates are automatically renewed via certbot
- Old Docker images are automatically cleaned up (older than 24 hours)
- Healthcheck verifies API availability every 30 seconds
