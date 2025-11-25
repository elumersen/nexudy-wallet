# Vercel Deployment Guide

This guide will walk you through deploying your NuxWallet project to Vercel.

## Prerequisites

1. A Vercel account ([Sign up here](https://vercel.com/signup))
2. A GitHub account (recommended for automatic deployments)
3. A Stripe account with production keys
4. A PostgreSQL database (Vercel Postgres, Supabase, or any PostgreSQL provider)

## Step 1: Prepare Your Database

**Important**: SQLite doesn't work on Vercel's serverless environment. You need PostgreSQL.

### Option A: Use Vercel Marketplace Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to your project → **Storage** tab
3. Click **Create Database** → Browse available database providers
4. Select a Postgres provider (e.g., **Neon**, **Supabase**, or other available options)
5. Follow the integration setup steps
6. Copy the connection string (you'll use this as `DATABASE_URL`)

**Note**: If you don't see Postgres options in Storage, you can also:

- Go to [Vercel Marketplace](https://vercel.com/integrations) → Search for "Postgres" or "Neon"
- Install the integration and connect it to your project
- The connection string will be automatically added as `DATABASE_URL` environment variable

#### If You Installed Prisma Postgres:

After connecting Prisma Postgres to your project, you'll see multiple connection strings. Here's what to do:

1. **Create/Update your local `.env.local` file** with the connection string:

   ```env
   DATABASE_URL="postgres://[your-credentials]@db.prisma.io:5432/postgres?sslmode=require"
   ```

   **Which connection string to use?**

   - Use the `POSTGRES_URL` value as your `DATABASE_URL` (your Prisma schema expects `DATABASE_URL`)
   - The `PRISMA_DATABASE_URL` with `prisma+postgres://` is for Prisma Accelerate (optional, for better performance)

2. **Generate Prisma Client** (if you haven't already or after schema changes):

   ```bash
   npx prisma generate
   ```

3. **If you're switching from SQLite to PostgreSQL** (you'll see error P3019):

   **First, close Prisma Studio if it's running** (press `Ctrl+C` in the terminal where it's running)

   Then remove the old SQLite migrations:

   ```bash
   # Delete the migrations directory
   Remove-Item -Recurse -Force prisma\migrations
   ```

   Or manually delete the `prisma/migrations` folder in your file explorer.

4. **Run migrations to create your database tables**:

   ```bash
   npx prisma migrate dev --name init
   ```

   This will:

   - Create new migration files for PostgreSQL
   - Apply the migrations to your Prisma Postgres database
   - Create all your tables (User, Transaction, SavedCard)

5. **Verify the connection** (optional):

   ```bash
   npx prisma studio
   ```

   This opens a visual database browser to see your tables.

   **Note**: If you get a "table does not exist" error, make sure migrations ran successfully first.

**Important**: Your Prisma schema is already configured correctly - you don't need to redefine it! Just use the connection strings provided.

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

| Variable Name                        | Description                   | Example                                               |
| ------------------------------------ | ----------------------------- | ----------------------------------------------------- |
| `DATABASE_URL`                       | PostgreSQL connection string  | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `STRIPE_SECRET_KEY`                  | Your Stripe secret key        | `sk_live_...` (production) or `sk_test_...` (testing) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key   | `pk_live_...` (production) or `pk_test_...` (testing) |
| `STRIPE_WEBHOOK_SECRET`              | Stripe webhook signing secret | `whsec_...`                                           |

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

- **NEXT*PUBLIC*\*** variables are exposed to the browser, so use them carefully
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

### Migration Provider Switch Error (P3019)

If you see: `The datasource provider 'postgresql' does not match 'sqlite' in migration_lock.toml`

**Solution**:

1. Close Prisma Studio if running (`Ctrl+C`)
2. Delete the `prisma/migrations` directory
3. Run `npx prisma migrate dev --name init` again

This happens when switching from SQLite (local) to PostgreSQL (production).

### Prisma Generate Permission Error (EPERM on Windows)

If you see: `EPERM: operation not permitted, rename 'query_engine-windows.dll.node'`

**Solution**:

1. Close Prisma Studio and any running Node processes
2. Close your IDE/editor temporarily
3. Run `npx prisma generate` again
4. If it still fails, restart your computer and try again

This is a Windows file locking issue - another process is using the Prisma engine file.

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
