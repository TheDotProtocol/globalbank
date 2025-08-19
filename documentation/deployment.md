# GlobalBank Deployment Guide

Complete deployment guide for GlobalBank digital banking platform.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Platform Deployment](#platform-deployment)
5. [Database Setup](#database-setup)
6. [Domain Configuration](#domain-configuration)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Security Configuration](#security-configuration)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Overview

### Deployment Options

**Recommended Platforms:**
1. **Vercel** (Recommended) - Fastest deployment with Next.js optimization
2. **Railway** - Easy PostgreSQL integration
3. **Render** - Good free tier with PostgreSQL support
4. **DigitalOcean** - Full control with App Platform

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (PostgreSQL)  │
│   Vercel        │    │   Vercel        │    │   Railway/DO    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   Email Service │    │   File Storage  │
│   (Vercel)      │    │   (Nodemailer) │    │   (AWS S3)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## ✅ Pre-Deployment Checklist

### Code Preparation
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Build process verified
- [ ] Error handling implemented
- [ ] Security measures in place

### Environment Variables
- [ ] Database connection string
- [ ] JWT secret key
- [ ] Stripe API keys
- [ ] Email service credentials
- [ ] AI API key (if using)
- [ ] File storage credentials

### Domain & SSL
- [ ] Custom domain purchased
- [ ] DNS records configured
- [ ] SSL certificate ready
- [ ] HTTPS redirects set up

---

## ⚙️ Environment Setup

### Required Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@globalbank.com"

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret"

# AI Service (Optional)
OPENAI_API_KEY="sk-..."

# File Storage (Optional)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

### Environment Variable Security

**Production Best Practices:**
1. **Never commit secrets to git**
2. **Use different keys for dev/prod**
3. **Rotate keys regularly**
4. **Use environment-specific configs**

---

## 🚀 Platform Deployment

### Option 1: Vercel (Recommended)

#### Step 1: Prepare Repository
```bash
# Ensure your code is in a Git repository
git init
git add .
git commit -m "Initial commit"

# Push to GitHub/GitLab
git remote add origin https://github.com/username/globalbank.git
git push -u origin main
```

#### Step 2: Deploy to Vercel
1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub/GitLab
   - Import your repository

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./` (or your project root)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required environment variables
   - Set them for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Verify deployment

#### Step 3: Custom Domain
1. **Add Domain**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Configure DNS**
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### Option 2: Railway

#### Step 1: Prepare for Railway
```bash
# Create railway.json configuration
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

#### Step 2: Deploy to Railway
1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Create new project

2. **Add PostgreSQL**
   - Add PostgreSQL service
   - Copy connection string to environment variables

3. **Deploy**
   - Railway will auto-deploy on git push
   - Monitor deployment logs

### Option 3: Render

#### Step 1: Prepare for Render
```bash
# Create render.yaml
services:
  - type: web
    name: globalbank
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

#### Step 2: Deploy to Render
1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Connect your Git repository
   - Create new Web Service

2. **Configure Service**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables

3. **Add PostgreSQL**
   - Create PostgreSQL service
   - Link to web service
   - Update DATABASE_URL

---

## 🗄️ Database Setup

### PostgreSQL Setup

#### Option 1: Railway PostgreSQL
1. **Create Database**
   - Go to Railway dashboard
   - Add PostgreSQL service
   - Copy connection string

2. **Run Migrations**
   ```bash
   # Update DATABASE_URL in environment
   DATABASE_URL="postgresql://..."

   # Run migrations
   npx prisma migrate deploy
   npx prisma generate
   ```

#### Option 2: DigitalOcean Managed Database
1. **Create Database**
   - Go to DigitalOcean dashboard
   - Create managed PostgreSQL database
   - Copy connection details

2. **Configure Connection**
   ```bash
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   ```

#### Option 3: Supabase
1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get connection string

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### Database Migration Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# View database
npx prisma studio
```

### Database Backup Strategy

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql

# Restore from backup
psql $DATABASE_URL < backup_20241219_143000.sql
```

---

## 🌐 Domain Configuration

### DNS Configuration

#### For Vercel
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### For Railway
```
Type: CNAME
Name: @
Value: your-app.railway.app
```

#### For Render
```
Type: CNAME
Name: @
Value: your-app.onrender.com
```

### SSL Certificate

**Automatic SSL (Recommended):**
- Vercel: Automatic SSL certificates
- Railway: Automatic SSL with custom domains
- Render: Automatic SSL certificates

**Manual SSL:**
```bash
# Using Let's Encrypt
certbot certonly --webroot -w /var/www/html -d your-domain.com
```

### Domain Verification

1. **Verify Domain Ownership**
   - Add TXT record for verification
   - Wait for DNS propagation (up to 48 hours)

2. **Test SSL Certificate**
   ```bash
   curl -I https://your-domain.com
   ```

---

## 📊 Monitoring & Analytics

### Error Monitoring

#### Sentry Integration
1. **Install Sentry**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Configure Sentry**
   ```javascript
   // sentry.client.config.js
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: "your-sentry-dsn",
     tracesSampleRate: 1.0,
   });
   ```

3. **Add to Environment Variables**
   ```bash
   SENTRY_DSN="your-sentry-dsn"
   ```

### Performance Monitoring

#### Vercel Analytics
```javascript
// Enable in next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true
  }
}
```

#### Custom Analytics
```javascript
// Track page views
export function trackPageView(url) {
  // Send to analytics service
  gtag('config', 'GA_MEASUREMENT_ID', {
    page_path: url,
  });
}
```

### Uptime Monitoring

#### Uptime Robot
1. **Create Account**
   - Go to [uptimerobot.com](https://uptimerobot.com)
   - Create free account

2. **Add Monitor**
   - URL: `https://your-domain.com`
   - Check every 5 minutes
   - Email notifications

#### Custom Health Check
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}
```

---

## 🔒 Security Configuration

### Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Rate Limiting

```javascript
// lib/rate-limit.js
import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### CORS Configuration

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check for TypeScript errors
npm run type-check

# Clear cache and rebuild
rm -rf .next
npm run build

# Check environment variables
echo $DATABASE_URL
```

#### 2. Database Connection Issues
```bash
# Test database connection
npx prisma db pull

# Check connection string
echo $DATABASE_URL

# Verify database exists
npx prisma studio
```

#### 3. Environment Variable Issues
```bash
# Check all environment variables
printenv | grep -E "(DATABASE|STRIPE|JWT|SMTP)"

# Verify in deployment platform
# Vercel: Project Settings → Environment Variables
# Railway: Variables tab
# Render: Environment tab
```

#### 4. Domain Issues
```bash
# Check DNS propagation
nslookup your-domain.com

# Test SSL certificate
curl -I https://your-domain.com

# Check redirects
curl -I http://your-domain.com
```

### Performance Issues

#### 1. Slow Loading
```javascript
// Enable Next.js optimizations
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  },
};
```

#### 2. Database Performance
```sql
-- Add indexes for common queries
CREATE INDEX idx_transactions_user_id ON transactions(userId);
CREATE INDEX idx_transactions_created_at ON transactions(createdAt);

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Debug Commands

```bash
# Check application logs
# Vercel
vercel logs

# Railway
railway logs

# Render
render logs

# Check database status
npx prisma db pull

# Test API endpoints
curl -X GET https://your-domain.com/api/health

# Monitor performance
npm run build -- --debug
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificate configured
- [ ] Domain DNS configured
- [ ] Monitoring set up

### Post-Deployment
- [ ] Application accessible
- [ ] Database connected
- [ ] API endpoints working
- [ ] Email service functional
- [ ] Stripe webhooks configured
- [ ] Error monitoring active
- [ ] Performance monitoring active
- [ ] Backup strategy implemented

### Security Verification
- [ ] HTTPS redirects working
- [ ] Security headers applied
- [ ] Rate limiting active
- [ ] CORS configured
- [ ] Environment variables secure
- [ ] Database access restricted

---

## 📞 Support

### Deployment Issues
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Railway**: [railway.app/support](https://railway.app/support)
- **Render**: [render.com/support](https://render.com/support)

### Documentation
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma**: [prisma.io/docs](https://prisma.io/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)

---

**Last Updated**: December 19, 2024  
**Deployment Version**: 1.0.0  
**Supported Platforms**: Vercel, Railway, Render, DigitalOcean 