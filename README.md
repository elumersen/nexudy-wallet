![App Screenshot](public/1.jpg) 
![App Screenshot](public/2.jpg)
![App Screenshot](public/3.jpg)
![App Screenshot](public/4.jpg) 
![App Screenshot](public/5.jpg) 
![App Screenshot](public/6.jpg) 
![App Screenshot](public/7.jpg) 
![App Screenshot](public/22.jpg)
![App Screenshot](public/8.jpg) 

# NuxWallet - Professional Digital Wallet System

<div align="center">

![NuxWallet](https://img.shields.io/badge/NuxWallet-Digital%20Banking-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Stripe](https://img.shields.io/badge/Stripe-Payment-purple?style=for-the-badge&logo=stripe)

A full-stack digital wallet application with modern UI/UX, user authentication, card management, and secure payment processing.

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [API](#api-endpoints) • [Deployment](#production-deployment)

</div>

---

## Features

### Authentication System

- **User Registration**: Secure signup with fullname, email, and password
- **User Login**: Email and password authentication
- **Session Management**: Client-side session storage
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Personalized Experience**: Welcome message with user's full name

### Card Management

- **Realistic Card Design**: Credit card-style UI with brand-specific gradients
  - Visa (Blue gradient)
  - Mastercard (Red-orange gradient)
  - Amex (Deep blue gradient)
  - Discover (Orange gradient)
- **EMV Chip Visual**: Golden chip graphic
- **Contactless Payment Icon**: Modern tap-to-pay symbol
- **Save Multiple Cards**: Store unlimited payment methods securely
- **Default Card**: Set and manage your preferred payment method
- **Stripe Integration**: Secure card tokenization via Stripe

### Wallet Features

- **Real-time Balance**: Live wallet balance display
- **Quick Top-Up**: Fast wallet recharge using saved cards
- **Transaction History**: Complete history of all transactions
- **Payment Processing**: Secure Stripe payment integration
- **Auto-Update**: Balance updates automatically after successful payments

### Modern UI/UX

- **Shadcn/ui Components**: Professional, accessible components
- **Responsive Design**: Seamless experience on mobile, tablet, and desktop
- **Sidebar Navigation**: Easy access to Dashboard, Cards, and Transactions
- **Dark Mode Support**: Automatic dark mode detection
- **Shimmer Loading**: Professional loading skeletons
- **Smooth Animations**: Polished transitions and hover effects

### Dashboard

- **Welcome Banner**: Personalized greeting
- **Balance Overview**: Prominent balance card with gradient
- **Quick Actions**: Direct links to manage cards and view transactions
- **Recent Transactions**: Latest activity at a glance
- **Logout**: Secure session termination

---

## Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: Shadcn/ui
- **Icons**: Lucide React
- **Forms**: Stripe Elements

### Backend

- **API**: Next.js API Routes
- **ORM**: Prisma
- **Database**: SQLite (Dev) / PostgreSQL (Production)
- **Authentication**: Custom JWT-less session management

### Payment Processing

- **Provider**: Stripe
- **Features**: Payment Intents, Setup Intents, Payment Methods
- **Security**: Webhook signature verification

---

## Project Structure

```
NuxWallet/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── signup/route.ts          # User registration
│   │   │   │   └── signin/route.ts          # User login
│   │   │   ├── balance/route.ts             # Get user balance
│   │   │   ├── topup/route.ts               # Create payment intent
│   │   │   ├── transactions/route.ts        # Get transaction history
│   │   │   ├── setup-intent/route.ts        # Create setup intent for card saving
│   │   │   ├── saved-cards/route.ts         # Manage saved cards (CRUD)
│   │   │   ├── set-default-card/route.ts    # Set default payment method
│   │   │   └── stripe-webhook/route.ts      # Handle Stripe events
│   │   ├── components/
│   │   │   ├── WalletDashboard.tsx          # Main dashboard
│   │   │   ├── BalanceCard.tsx              # Balance display
│   │   │   ├── TopupForm.tsx                # Payment form
│   │   │   ├── TransactionHistory.tsx       # Transaction table
│   │   │   ├── SavedCards.tsx               # Card management with realistic design
│   │   │   ├── AddCardModal.tsx             # Add new card modal
│   │   │   ├── Sidebar.tsx                  # Navigation sidebar
│   │   │   ├── LayoutWrapper.tsx            # Conditional layout wrapper
│   │   │   └── Toast.tsx                    # Toast notifications
│   │   ├── signin/page.tsx                  # Sign in page
│   │   ├── signup/page.tsx                  # Sign up page
│   │   ├── cards/page.tsx                   # Card management page
│   │   ├── transactions/page.tsx            # Full transaction history
│   │   ├── layout.tsx                       # Root layout
│   │   ├── globals.css                      # Global styles + shimmer animation
│   │   └── page.tsx                         # Home (Dashboard)
│   ├── lib/
│   │   ├── auth.ts                          # Authentication utilities
│   │   ├── prisma.ts                        # Prisma client
│   │   ├── stripe.ts                        # Stripe client
│   │   └── utils.ts                         # Helper functions
│   └── components/ui/                       # Shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── ...
├── prisma/
│   ├── schema.prisma                        # Database schema
│   └── migrations/                          # Database migrations
├── .env.local                               # Environment variables
└── package.json
```

---

## Installation

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Stripe Account** ([Sign up here](https://dashboard.stripe.com/register))
- **Stripe CLI** for local webhook testing ([Install guide](https://stripe.com/docs/stripe-cli))

### 1. Clone the Repository

```bash
git clone <repository-url>
cd NuxWallet-Payment-Happens-In-Just-A-Click-master
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
NuxT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

**Get your Stripe keys:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** and **Secret key**
3. Replace the placeholder values in `.env.local`


### 4. Set Up the Database

Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

This will:

- Create a `dev.db` SQLite database
- Generate the Prisma Client
- Set up User, Transaction, and SavedCard tables

### 5. Configure Stripe Webhooks (Local Development)

Open a new terminal and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Copy the webhook signing secret (e.g., `whsec_xxxxx`) and add it to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_from_cli"
```

**Keep this terminal window open while testing payments.**

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

### Getting Started

#### 1. Sign Up

1. Navigate to `http://localhost:3000`
2. Click "Sign Up" or visit `/signup`
3. Enter your full name, email, and password (min 6 characters)
4. Click "Create Account"

#### 2. Sign In

1. After signup, you'll be redirected to `/signin`
2. Enter your email and password
3. Click "Sign In"
4. You'll be taken to your personalized dashboard

### Dashboard Overview

The dashboard displays:

- **Welcome message** with your full name
- **Balance card** showing available funds
- **Top-up form** to add money (requires saved card)
- **Recent transactions** (last 5)
- **Quick links** to manage cards and view all transactions

### Adding a Payment Card

1. Navigate to **Cards** page via sidebar or "Manage Cards" link
2. Click **"Add Card"** button
3. Enter card details in the modal:
   - Card number
   - Expiry date (MM/YY)
   - CVC
   - ZIP code
4. Click **"Add Card"**
5. Your card will appear as a realistic credit card with:
   - EMV chip
   - Contactless icon
   - Masked card number (•••• •••• •••• 1234)
   - Expiry date
   - Brand-specific gradient

### Test Card Details

Use these Stripe test cards:

| Card Number         | Brand      | Result                   |
| ------------------- | ---------- | ------------------------ |
| 4242 4242 4242 4242 | Visa       | ✅ Success               |
| 5555 5555 5555 4444 | Mastercard | ✅ Success               |
| 3782 822463 10005   | Amex       | ✅ Success               |
| 4000 0000 0000 0002 | Visa       | ❌ Declined              |
| 4000 0000 0000 9995 | Visa       | ❌ Insufficient          |
| 4000 0000 0000 3220 | 3DS        | 🔐 authentication needed |

- **Expiry**: Any future date (e.g., 12/28)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

More test cards: [Stripe Testing Docs](https://stripe.com/docs/testing)

### Managing Cards

On the **Cards** page, you can:

- **View all saved cards** in a grid layout
- **Set default card**: Hover over a card and click "Set Default"
- **Remove card**: Hover over a card and click "Remove"
- **Add new card**: Click the "Add Card" button

The default card will have a "DEFAULT" badge and will be preselected for top-ups.

### Topping Up Your Wallet

1. Go to **Dashboard**
2. Enter amount in dollars (e.g., 25.00)
3. Select a saved card from the dropdown
4. Click **"Top Up"**
5. Payment processes instantly
6. Balance updates automatically
7. Transaction appears in history

### Viewing Transactions

**Option 1: Dashboard (Recent)**

- View last 5 transactions on the dashboard

**Option 2: Transactions Page (Full History)**

1. Click **"Transactions"** in sidebar or "View All" link
2. See complete transaction history
3. Each transaction shows:
   - Amount
   - Type (Top-up)
   - Status (Completed/Pending/Failed)
   - Date and time
   - Transaction ID

### Logging Out

1. Click **"Logout"** button in the top-right of the dashboard
2. You'll be redirected to the sign-in page
3. Your session will be cleared

---

## API Endpoints

### Authentication

#### POST `/api/auth/signup`

Register a new user.

**Request:**

```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "xxx",
    "email": "john@example.com",
    "fullname": "John Doe",
    "balance": 0
  }
}
```

#### POST `/api/auth/signin`

Authenticate a user.

**Request:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "xxx",
    "email": "john@example.com",
    "fullname": "John Doe",
    "balance": 1000
  }
}
```

### Wallet

#### GET `/api/balance`

Get current user's balance.

**Response:**

```json
{
  "balance": 5000
}
```

#### POST `/api/topup`

Create payment intent for top-up.

**Request:**

```json
{
  "amount": 2500,
  "paymentMethodId": "pm_xxxxx"
}
```

**Response:**

```json
{
  "clientSecret": "pi_xxxxx_secret_xxxxx"
}
```

#### GET `/api/transactions`

Get all transactions.

**Response:**

```json
{
  "transactions": [
    {
      "id": "xxx",
      "amount": 2500,
      "type": "TOPUP",
      "status": "COMPLETED",
      "createdAt": "2025-10-11T12:00:00.000Z"
    }
  ]
}
```

### Card Management

#### POST `/api/setup-intent`

Create setup intent for saving a card.

**Request:**

```json
{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "clientSecret": "seti_xxxxx_secret_xxxxx"
}
```

#### GET `/api/saved-cards?email=john@example.com`

Get all saved cards for a user.

**Response:**

```json
{
  "savedCards": [
    {
      "id": "xxx",
      "last4": "4242",
      "brand": "visa",
      "expMonth": 12,
      "expYear": 2028,
      "isDefault": true
    }
  ]
}
```

#### POST `/api/saved-cards`

Save a new card.

**Request:**

```json
{
  "email": "john@example.com",
  "paymentMethodId": "pm_xxxxx"
}
```

#### DELETE `/api/saved-cards?cardId=xxx&email=john@example.com`

Remove a saved card.

#### POST `/api/set-default-card`

Set a card as default.

**Request:**

```json
{
  "email": "john@example.com",
  "cardId": "xxx"
}
```

### Webhooks

#### POST `/api/stripe-webhook`

Handle Stripe webhook events.

**Events:**

- `payment_intent.succeeded`: Update balance and transaction status
- `payment_intent.payment_failed`: Mark transaction as failed

---

## Database Schema

```prisma
model User {
  id               String        @id @default(cuid())
  email            String        @unique
  fullname         String
  password         String        // Base64 encoded (use bcrypt in production)
  balance          Int           @default(0)
  stripeCustomerId String?       @unique
  createdAt        DateTime      @default(now())
  transactions     Transaction[]
  savedCards       SavedCard[]
}

model Transaction {
  id                    String            @id @default(cuid())
  userId                String
  user                  User              @relation(fields: [userId], references: [id])
  amount                Int
  type                  TransactionType
  status                TransactionStatus
  stripePaymentIntentId String?           @unique
  createdAt             DateTime          @default(now())
}

model SavedCard {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id])
  stripePaymentMethodId String   @unique
  last4                 String
  brand                 String
  expMonth              Int
  expYear               Int
  isDefault             Boolean  @default(false)
  createdAt             DateTime @default(now())
}

enum TransactionType {
  TOPUP
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
}
```

---

## Production Deployment

### 1. Update Environment Variables

For production:

- Use **production** Stripe keys (remove `_test_`)
- Use a production database (PostgreSQL recommended)
- Set up a real webhook endpoint

### 2. Database Migration

For PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

Run migrations:

```bash
npx prisma migrate deploy
```

### 3. Configure Stripe Webhooks

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter: `https://yourdomain.com/api/stripe-webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook secret to your environment variables

### 4. Deploy to Vercel

```bash
npm run build
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## Troubleshooting

### Hydration Errors

- **Issue**: "Hydration failed" errors in console
- **Fix**: Already implemented - pages use `useEffect` to load user data client-side

### Payments Not Updating Balance

- Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
- Check `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Verify events in Stripe CLI terminal

### Cards Not Saving

- Check browser console for errors
- Verify Stripe keys are correct
- Ensure Setup Intent is created successfully

### Database Errors

- Regenerate Prisma Client: `npx prisma generate`
- Reset database: `npx prisma migrate reset --force`

### TypeScript Errors

- Install dependencies: `npm install`
- Restart dev server: `npm run dev`

---

## Design System

### Colors

- **Primary**: Green (#16a34a)
- **Success**: Green (#22c55e)
- **Error**: Red (#ef4444)
- **Warning**: Orange (#f97316)

### Card Brand Gradients

- **Visa**: Blue (from-blue-600 to-blue-800)
- **Mastercard**: Red-Orange (from-red-600 to-orange-600)
- **Amex**: Deep Blue (from-blue-700 to-blue-900)
- **Discover**: Orange (from-orange-500 to-orange-700)

### Components

All UI components use [Shadcn/ui](https://ui.shadcn.com/) for consistency and accessibility.
