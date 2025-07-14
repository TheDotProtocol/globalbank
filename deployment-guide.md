# GlobalBank Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel Deployment (Recommended)

Since your domain `globaldotbank.org` is already on Vercel, this is the most seamless approach.

#### Step 1: Prepare for Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Initialize Vercel in your project**
   ```bash
   cd globalbank
   vercel
   ```

#### Step 2: Configure Environment Variables

In your Vercel dashboard, add these environment variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key-here"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"

# OpenAI Configuration
OPENAI_API_KEY="sk-your-openai-api-key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Admin Credentials (DO NOT CHANGE)
ADMIN_USERNAME="admingdb"
ADMIN_PASSWORD="GlobalBank2024!@#$%^&*()_+SecureAdmin"

# Environment
NODE_ENV="production"

# Next.js Configuration
NEXTAUTH_URL="https://globaldotbank.org"
NEXTAUTH_SECRET="your-nextauth-secret"

# Security
CORS_ORIGIN="https://globaldotbank.org"
```

#### Step 3: Deploy to Vercel

1. **Deploy the application**
   ```bash
   vercel --prod
   ```

2. **Configure custom domain**
   - Go to Vercel dashboard
   - Navigate to your project
   - Go to Settings > Domains
   - Add `globaldotbank.org`
   - Update DNS records as instructed by Vercel

#### Step 4: Database Setup

1. **Set up PostgreSQL database**
   - Use a service like Supabase, Railway, or Neon
   - Get your database connection string
   - Update `DATABASE_URL` in Vercel environment variables

2. **Run database migrations**
   ```bash
   npx prisma db push
   ```

### Option 2: Docker Deployment

If you prefer containerized deployment:

#### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Step 2: Build and Deploy

```bash
# Build Docker image
docker build -t globalbank .

# Run container
docker run -p 3000:3000 globalbank
```

### Option 3: Traditional Server Deployment

For deployment on traditional servers (AWS, DigitalOcean, etc.):

#### Step 1: Server Setup

1. **Install Node.js 18+**
2. **Install PostgreSQL 14+**
3. **Set up Nginx as reverse proxy**

#### Step 2: Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd globalbank

# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm start
```

## 🔧 Domain Configuration

### Current Setup
- Domain: `globaldotbank.org`
- Current: Basic website on Vercel
- Goal: Deploy GlobalBank app

### Recommended Approach

1. **Deploy GlobalBank app to Vercel**
2. **Update DNS to point to new app**
3. **Keep basic website as landing page** (optional)

### DNS Configuration

After deploying to Vercel, update your DNS records:

```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 📊 Monitoring & Analytics

### Vercel Analytics
- Built-in performance monitoring
- Real-time analytics
- Error tracking

### Custom Monitoring
- Performance monitoring system (implemented)
- Fraud detection alerts
- Admin dashboard metrics

## 🔐 Security Considerations

### Production Security Checklist

- [ ] **Environment Variables**: All secrets properly configured
- [ ] **Database Security**: PostgreSQL with SSL enabled
- [ ] **HTTPS**: SSL certificate configured
- [ ] **Rate Limiting**: API protection enabled
- [ ] **Input Validation**: All inputs sanitized
- [ ] **Admin Access**: Secure admin portal
- [ ] **Monitoring**: Performance and fraud monitoring active

### Admin Portal Access

- **URL**: `https://globaldotbank.org/admin/login`
- **Username**: `admingdb`
- **Password**: `GlobalBank2024!@#$%^&*()_+SecureAdmin`

## 🚀 Quick Deployment Steps

### For Vercel (Recommended)

1. **Prepare your code**
   ```bash
   cd globalbank
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Configure environment variables** in Vercel dashboard

4. **Set up database** and update `DATABASE_URL`

5. **Update DNS** to point to Vercel

6. **Test the application**
   - Main app: `https://globaldotbank.org`
   - Admin portal: `https://globaldotbank.org/admin/login`

## 📞 Support

### Deployment Issues
- Check Vercel deployment logs
- Verify environment variables
- Test database connection
- Review build errors

### Post-Deployment
- Monitor performance metrics
- Check fraud detection system
- Verify admin portal access
- Test all banking features

---

**GlobalBank - Ready for Production Deployment** 🏦 