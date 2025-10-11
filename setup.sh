#!/bin/bash

# NexWallet Setup Script
# This script sets up the database and prepares the application

echo "🚀 NexWallet Setup Script"
echo "========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm detected: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✅ Prisma Client generated"
echo ""

# Run database migration
echo "🗄️  Running database migration..."
npx prisma migrate dev --name add_saved_cards
if [ $? -ne 0 ]; then
    echo "⚠️  Migration may have failed or was cancelled"
    echo "   You can manually run: npx prisma migrate dev --name add_saved_cards"
else
    echo "✅ Database migration completed"
fi
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "   Creating .env template..."
    cat > .env << EOL
DATABASE_URL="file:./dev.db"
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
EOL
    echo "✅ .env template created. Please update with your Stripe keys."
else
    echo "✅ .env file exists"
fi
echo ""

echo "========================="
echo "🎉 Setup Complete!"
echo "========================="
echo ""
echo "Next steps:"
echo "1. Update your .env file with Stripe API keys"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"
echo ""
echo "📚 For more information, see:"
echo "   - FEATURES_SETUP.md"
echo "   - CHANGES_SUMMARY.md"
echo ""

