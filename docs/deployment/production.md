# Production Deployment

This guide covers deploying Indorder to production environments.

## Prerequisites

Before deploying, ensure you have:
- ✅ Completed local testing
- ✅ Set up production database
- ✅ Configured Clerk for production
- ✅ Obtained OpenAI API key
- ✅ Deployed backend service (WhatsApp integration)

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended platform as it's built by the Next.js team and offers zero-config deployment.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Connect Repository

```bash
vercel login
vercel link
```

#### Step 3: Configure Environment Variables

In the Vercel dashboard, add these environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# WhatsApp Backend
NEXT_PUBLIC_BACKEND_URL=https://your-backend.com

# OpenAI
OPENAI_API_KEY=sk-...

# Node Environment
NODE_ENV=production
```

#### Step 4: Deploy

```bash
vercel --prod
```

Your application will be deployed to `https://your-app.vercel.app`.

#### Configure Custom Domain

1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Option 2: Railway

Railway provides full-stack hosting with integrated database.

#### Step 1: Create Railway Account

Visit [railway.app](https://railway.app) and create an account.

#### Step 2: Create New Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

#### Step 3: Add PostgreSQL Database

```bash
railway add postgresql
```

Railway automatically sets `DATABASE_URL`.

#### Step 4: Configure Environment Variables

```bash
railway variables set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
railway variables set CLERK_SECRET_KEY="sk_live_..."
railway variables set NEXT_PUBLIC_BACKEND_URL="https://backend.com"
railway variables set OPENAI_API_KEY="sk-..."
```

#### Step 5: Deploy

```bash
railway up
```

### Option 3: Docker Self-Hosted

Deploy using Docker containers on your own infrastructure.

#### Create Dockerfile

Already included in the project (if not, create):

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Build and Run

```bash
# Build image
docker build -t indorder:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..." \
  -e CLERK_SECRET_KEY="sk_live_..." \
  -e NEXT_PUBLIC_BACKEND_URL="https://backend.com" \
  -e OPENAI_API_KEY="sk-..." \
  --name indorder \
  indorder:latest
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/indorder
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - NEXT_PUBLIC_BACKEND_URL=${BACKEND_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=indorder
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Deploy:

```bash
docker-compose up -d
```

## Database Setup

### Option 1: Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Set `DATABASE_URL` environment variable
4. Run migrations:

```bash
npm run db:push
```

### Option 2: Neon

1. Create database at [neon.tech](https://neon.tech)
2. Copy connection string
3. Set `DATABASE_URL` environment variable
4. Run migrations

### Option 3: AWS RDS

1. Create PostgreSQL instance in RDS
2. Configure security groups
3. Get connection string
4. Set `DATABASE_URL`
5. Run migrations

### Run Database Migrations

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

## Clerk Production Setup

### Configure Production Instance

1. Go to [clerk.com](https://clerk.com) dashboard
2. Switch to production instance
3. Configure allowed origins:
   - Add your production domain
   - Add Vercel preview domains if using Vercel

### Update Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Configure Webhooks (Optional)

Set up webhooks for user sync:

1. Go to Clerk dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`

## Environment Variables Checklist

Required for production:

```env
# ✅ Database
DATABASE_URL=postgresql://...

# ✅ Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# ✅ WhatsApp Backend
NEXT_PUBLIC_BACKEND_URL=https://...

# ✅ OpenAI
OPENAI_API_KEY=sk-...

# ✅ Node Environment
NODE_ENV=production
```

## Security Hardening

### 1. Enable HTTPS

Ensure SSL/TLS is enabled:
- Vercel: Automatic
- Railway: Automatic
- Self-hosted: Use nginx with Let's Encrypt

### 2. Set Security Headers

Add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### 3. Environment Variable Security

- Never commit `.env` files
- Use platform secret management
- Rotate keys regularly
- Limit API key permissions

### 4. Database Security

- Use strong passwords
- Enable SSL connections
- Whitelist IP addresses
- Regular backups
- Connection pooling

## Performance Optimization

### 1. Enable Caching

```typescript
// In server actions
import { unstable_cache } from 'next/cache';

export const getReceipts = unstable_cache(
  async (userId: number) => {
    return await db.query.receipts.findMany(...);
  },
  ['receipts'],
  { revalidate: 60 }
);
```

### 2. Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority
/>
```

### 3. Database Connection Pooling

```typescript
const conn = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
```

### 4. Enable Compression

Vercel enables this by default. For self-hosted:

```javascript
// next.config.js
module.exports = {
  compress: true,
};
```

## Monitoring and Logging

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking with Sentry

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Database Monitoring

- Supabase: Built-in dashboard
- Neon: Built-in monitoring
- RDS: CloudWatch metrics

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_PUBLISHABLE_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Health Checks

Create health check endpoint:

```typescript
// app/api/health/route.ts
import { db } from '~/server/db';

export async function GET() {
  try {
    // Check database connection
    await db.execute(sql`SELECT 1`);

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: 'Database connection failed',
      },
      { status: 500 }
    );
  }
}
```

## Backup Strategy

### Database Backups

#### Automated Backups (Supabase/Neon)
- Automatic daily backups
- Point-in-time recovery
- Managed by platform

#### Manual Backups (Self-Hosted)

```bash
# Backup
pg_dump -h host -U user -d indorder > backup_$(date +%Y%m%d).sql

# Restore
psql -h host -U user -d indorder < backup_20250113.sql
```

#### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
FILENAME="indorder_backup_${DATE}.sql"

pg_dump $DATABASE_URL > "${BACKUP_DIR}/${FILENAME}"

# Keep only last 7 days
find ${BACKUP_DIR} -name "*.sql" -mtime +7 -delete

# Upload to S3
aws s3 cp "${BACKUP_DIR}/${FILENAME}" s3://my-backups/
```

Schedule with cron:
```cron
0 2 * * * /path/to/backup.sh
```

## Rollback Procedure

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Railway
```bash
railway rollback
```

### Docker
```bash
# Tag stable version
docker tag indorder:latest indorder:stable

# Rollback
docker stop indorder
docker rm indorder
docker run -d --name indorder indorder:stable
```

## Post-Deployment Checklist

- ✅ Application loads correctly
- ✅ Database connection working
- ✅ Authentication functioning
- ✅ WhatsApp integration active
- ✅ Orders displaying correctly
- ✅ Analytics showing data
- ✅ SSL certificate valid
- ✅ Health check endpoint responding
- ✅ Error tracking configured
- ✅ Backups scheduled
- ✅ Monitoring alerts set up

## Troubleshooting

### Application Won't Start

Check logs:
```bash
# Vercel
vercel logs

# Railway
railway logs

# Docker
docker logs indorder
```

Common issues:
- Missing environment variables
- Database connection failed
- Build errors

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is running
- Verify firewall rules
- Test connection manually:

```bash
psql $DATABASE_URL
```

### Clerk Authentication Not Working

- Verify API keys are production keys
- Check allowed domains in Clerk dashboard
- Ensure HTTPS is enabled

## Related Documentation

- [Environment Variables](./environment-variables.md)
- [Database Management](./database-management.md)
- [System Overview](../architecture/overview.md)

---

Following this guide ensures a smooth, secure production deployment of Indorder.
