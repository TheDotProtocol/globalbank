# Environment Variables Guide for GlobalBank Deployment

## Required Environment Variables for Railway/Vercel Deployment

### Database
```
DATABASE_URL=your_railway_postgres_connection_string
```

### Authentication
```
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=https://your-app-name.railway.app
JWT_SECRET=your_jwt_secret_key_here
```

### Stripe (Payment Processing)
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Resend (Email Service)
```
RESEND_API_KEY=re_8dzAZGVf_7943rLPnE1ko55Z2s7kvbLfw
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_8dzAZGVf_7943rLPnE1ko55Z2s7kvbLfw
SMTP_FROM=noreply@globalbank.com
```

### OpenAI (AI Assistant)
```
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-app-name.railway.app
NODE_ENV=production
```

## How to Get These Values

### 1. Database URL (Railway)
- Go to your Railway project
- Click on the PostgreSQL service
- Copy the connection string from the "Connect" tab

### 2. Stripe Keys
- Go to https://dashboard.stripe.com/
- Sign up/login to your Stripe account
- Go to Developers > API Keys
- Copy the "Secret key" (starts with `sk_test_`)
- Copy the "Publishable key" (starts with `pk_test_`)
- For webhook secret, go to Developers > Webhooks and create one

### 3. Resend Configuration
- You already have the API key: `re_8dzAZGVf_7943rLPnE1ko55Z2s7kvbLfw`
- SMTP settings are already configured above

### 4. OpenAI API Key
- Go to https://platform.openai.com/
- Sign up/login
- Go to API Keys section
- Create a new API key

### 5. Generate Secrets
For NEXTAUTH_SECRET and JWT_SECRET, generate random strings:
```bash
# Generate a random secret
openssl rand -base64 32
```

## Railway Environment Variables Setup

1. Go to your Railway project dashboard
2. Click on your app service
3. Go to "Variables" tab
4. Add each environment variable:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=https://your-app-name.railway.app
JWT_SECRET=your_generated_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
RESEND_API_KEY=re_8dzAZGVf_7943rLPnE1ko55Z2s7kvbLfw
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_8dzAZGVf_7943rLPnE1ko55Z2s7kvbLfw
SMTP_FROM=noreply@globalbank.com
OPENAI_API_KEY=sk-your_openai_key
NEXT_PUBLIC_APP_URL=https://your-app-name.railway.app
NODE_ENV=production
```

## Testing the Configuration

After setting up the environment variables:

1. **Test Database Connection**: The app should connect to PostgreSQL
2. **Test Email**: Try registering a new user to test email sending
3. **Test Stripe**: Try making a test payment (use Stripe test cards)
4. **Test AI**: Try using the BankBugger AI assistant

## Troubleshooting

### Common Issues:
1. **Database Connection Failed**: Check DATABASE_URL format
2. **Email Not Sending**: Verify Resend API key and SMTP settings
3. **Stripe Errors**: Ensure all Stripe keys are correct
4. **Build Failures**: Check that all required variables are set

### Stripe Test Cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits 