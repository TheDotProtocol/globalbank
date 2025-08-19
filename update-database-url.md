# Update DATABASE_URL in Vercel

## Your Supabase Connection String:
```
postgresql://postgres:AskTrabaajo@go3@db.rbmpeyjaoitdvafxntao.supabase.co:5432/postgres
```

## Steps to Update in Vercel Dashboard:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your `globalbank` project

2. **Navigate to Environment Variables**
   - Go to **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Update DATABASE_URL**
   - Find the existing `DATABASE_URL` variable
   - Click the **Edit** (pencil) icon
   - Replace the value with your Supabase connection string:
   ```
   postgresql://postgres:AskTrabaajo@go3@db.rbmpeyjaoitdvafxntao.supabase.co:5432/postgres
   ```
   - Make sure it's set for **Production**, **Preview**, and **Development**
   - Click **Save**

4. **Redeploy**
   - Go to **Deployments** tab
   - Click **Redeploy** on your latest deployment

## Alternative: Use Vercel CLI

If you prefer command line:

```bash
# Remove the old DATABASE_URL
vercel env rm DATABASE_URL

# Add the new DATABASE_URL
vercel env add DATABASE_URL
# Enter: postgresql://postgres:AskTrabaajo@go3@db.rbmpeyjaoitdvafxntao.supabase.co:5432/postgres

# Redeploy
vercel --prod
```

## After Updating:

1. **Test the connection** by visiting your app
2. **Try registration** - it should work now
3. **Check the health endpoint** for database status 