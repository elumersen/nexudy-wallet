# Vercel Deployment Guide

This guide will walk you through deploying your NuxWallet project to Vercel.

## Prerequisites

1. A Vercel account ([Sign up here](https://vercel.com/signup))
2. A GitHub account (recommended for automatic deployments)
3. A Stripe account with production keys
4. A PostgreSQL database (Vercel Postgres, Supabase, or any PostgreSQL provider)

## Step 1: Prepare Your Database

**Important**: SQLite doesn't work on Vercel's serverless environment. You need PostgreSQL.

### Option A: Use Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to your project → **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. Copy the connection string (you'll use this as `DATABASE_URL`)

### Option B: Use External PostgreSQL (Supabase, Railway, etc.)

1. Create a PostgreSQL database on your preferred provider
2. Copy the connection string
3. Format: `postgresql://user:password@host:port/database?sslmode=require`

### Update Prisma Schema

The schema has been updated to support PostgreSQL. Run migrations:

```bash
npx prisma migrate deploy
```

## Step 2: Push Your Code to GitHub

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. **Don't deploy yet** - we need to add environment variables first!

### Method 2: Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

## Step 4: Add Environment Variables

This is the most important step! You need to add all variables from your `.env.local` file.

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable one by one:

#### Required Environment Variables:

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `STRIPE_SECRET_KEY` | Your Stripe secret key | `sk_live_...` (production) or `sk_test_...` (testing) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | `pk_live_...` (production) or `pk_test_...` (testing) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |

### Adding Variables:

1. Click **Add New**
2. Enter the **Name** (exactly as shown above)
3. Enter the **Value** (from your `.env.local` file)
4. Select environments:
   - ✅ **Production**
   - ✅ **Preview** (optional, for testing)
   - ✅ **Development** (optional)
5. Click **Save**

### Important Notes:

- **NEXT_PUBLIC_*** variables are exposed to the browser, so use them carefully
- **Never commit** `.env.local` to Git
- Use **production Stripe keys** (`sk_live_` and `pk_live_`) for production
- Use **test Stripe keys** (`sk_test_` and `pk_test_`) for preview deployments

## Step 5: Configure Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your Vercel URL: `https://your-project.vercel.app/api/stripe-webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 6: Run Database Migrations

After deploying, you need to run Prisma migrations:

### Option 1: Via Vercel CLI

```bash
vercel env pull .env.local  # Pull environment variables
npx prisma migrate deploy
```

### Option 2: Via Vercel Dashboard

1. Go to your project → **Settings** → **Build & Development Settings**
2. Add a build command (if not already set):
   ```bash
   npm run build && npx prisma migrate deploy
   ```

Or run migrations manually after deployment using Vercel's CLI or a one-time script.

## Step 7: Deploy

1. If using GitHub integration, push a new commit or click **Redeploy**
2. If using CLI, run:
   ```bash
   vercel --prod
   ```

3. Wait for deployment to complete
4. Visit your deployed site: `https://your-project.vercel.app`

## Step 8: Verify Deployment

1. ✅ Check that the site loads
2. ✅ Test user registration
3. ✅ Test adding a card
4. ✅ Test a payment (use Stripe test cards)
5. ✅ Check that webhooks are working (check Stripe Dashboard → Events)

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `DATABASE_URL` is correct
- Run `npm run build` locally to catch errors

### Database Connection Errors

- Verify `DATABASE_URL` format is correct
- Ensure database allows connections from Vercel IPs
- Check SSL mode: `?sslmode=require` at end of connection string

### Stripe Errors

- Verify Stripe keys are correct
- Check webhook endpoint URL matches your deployment
- Ensure webhook secret is set correctly

### Environment Variables Not Working

- Variables starting with `NEXT_PUBLIC_` are available in browser
- Server-side variables (without `NEXT_PUBLIC_`) are only available in API routes
- Redeploy after adding new environment variables

## Quick Reference: Environment Variables

Copy these from your `.env.local` and add to Vercel:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
STRIPE_SECRET_KEY=sk_live_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Next Steps

- Set up custom domain (optional)
- Enable analytics (optional)
- Set up preview deployments for testing
- Configure automatic deployments from GitHub

---

**Need Help?** Check [Vercel Documentation](https://vercel.com/docs) or [Next.js Deployment Guide](https://nextjs.org/docs/deployment)




