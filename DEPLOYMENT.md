# MaxMove Deployment Guide

This guide provides instructions for deploying the MaxMove application to a production environment with a custom domain.

## Prerequisites

- Docker and Docker Compose installed on your server
- A domain name pointing to your server's IP address
- SSL certificates for your domain (recommended to use Let's Encrypt)
- Basic knowledge of nginx or another reverse proxy

## Deployment Steps

### 1. Prepare Your Environment

1. Clone the repository on your server:
   ```bash
   git clone https://github.com/maxvaljan/maxmove-monorepo.git
   cd maxmove-monorepo
   ```

2. Create your `.env` file based on the provided example:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your actual configuration values:
   ```bash
   nano .env
   ```
   
   Be sure to update:
   - `CUSTOM_DOMAIN` with your actual domain
   - All Supabase, Stripe, and other API credentials
   - `CORS_ALLOWED_ORIGINS` to include your domain
   - `NEXT_PUBLIC_API_URL` to point to your API subdomain (e.g., `https://api.yourdomain.com`)

### 2. Set Up Domain Configuration

#### Option 1: Using Docker and Nginx Proxy Manager

1. Add Nginx Proxy Manager to your `docker-compose.prod.yml`:

```yaml
  nginx-proxy-manager:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
      - '81:81'
    volumes:
      - ./data/nginx/data:/data
      - ./data/nginx/letsencrypt:/etc/letsencrypt
    networks:
      - maxmove-network
```

2. Access Nginx Proxy Manager at `http://your-server-ip:81` and set up:
   - A proxy host for your web UI (e.g., `yourdomain.com` -> `web-ui:3000`)
   - A proxy host for your API (e.g., `api.yourdomain.com` -> `backend:3000`)
   - Enable SSL for both domains

#### Option 2: Using Existing Nginx on Host

1. Create Nginx configuration for your domains:

```nginx
# /etc/nginx/sites-available/yourdomain.com
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# /etc/nginx/sites-available/api.yourdomain.com
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. Enable sites and restart Nginx:
```bash
ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 3. Deploy the Application

1. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. Verify the services are running:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

3. Check the logs if there are any issues:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

## Updating Your Deployment

When you need to update your application:

1. Pull the latest changes:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart the containers:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Continuous Integration/Deployment (CI/CD)

For a more automated approach, consider setting up CI/CD with GitHub Actions:

1. Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/maxmove-monorepo
            git pull origin main
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml build
            docker-compose -f docker-compose.prod.yml up -d
```

2. Add the necessary secrets in your GitHub repository settings.

## Monitoring and Maintenance

1. Set up basic monitoring:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f > /var/log/maxmove.log
   ```

2. Consider using a tool like Portainer for Docker management:
   ```yaml
   portainer:
     image: portainer/portainer-ce:latest
     restart: unless-stopped
     ports:
       - "9000:9000"
     volumes:
       - /var/run/docker.sock:/var/run/docker.sock
       - ./data/portainer:/data
     networks:
       - maxmove-network
   ```

3. Implement regular backups of important data:
   ```bash
   # Example backup script
   mkdir -p /backups/maxmove/$(date +%Y-%m-%d)
   cp -r ./data /backups/maxmove/$(date +%Y-%m-%d)/
   ```

## Troubleshooting

- **Services not starting**: Check the logs with `docker-compose -f docker-compose.prod.yml logs -f [service-name]`
- **Can't access via domain**: Verify Nginx configuration and DNS settings
- **API connection issues**: Check CORS settings and ensure `NEXT_PUBLIC_API_URL` is correctly set

## Security Considerations

1. Keep secrets safe and never commit them to the repository
2. Use a firewall to restrict access to your server
3. Regularly update dependencies and Docker images
4. Set up SSL certificates for all domains
5. Consider using environment-specific configuration for development/staging/production