import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    
    const pendingTransactions = await prisma.transaction.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const webhookSecretSet = !!process.env.STRIPE_WEBHOOK_SECRET;
    const stripeKeySet = !!process.env.STRIPE_SECRET_KEY;

    const diagnostics = {
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userExists: !!user,
        userId: user?.id
      },
      stripe: {
        secretKeyConfigured: stripeKeySet,
        webhookSecretConfigured: webhookSecretSet,
        webhookSecretSource: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) + '...'
      },
      transactions: {
        pendingCount: pendingTransactions.length,
        pendingTransactions: pendingTransactions.map(t => ({
          id: t.id,
          amount: t.amount,
          stripePaymentIntentId: t.stripePaymentIntentId,
          createdAt: t.createdAt
        }))
      },
      troubleshooting: {
        message: pendingTransactions.length > 0 
          ? 'WARNING: You have pending transactions. Make sure Stripe CLI is running with: stripe listen --forward-to localhost:3000/api/stripe-webhook'
          : 'No pending transactions found'
      }
    };

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: errorMessage,
      troubleshooting: 'Check if Prisma is properly configured and database migrations are run'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { stripePaymentIntentId } = await req.json();

    if (!stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'stripePaymentIntentId is required' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { stripePaymentIntentId }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Transaction is already ${transaction.status}` },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      });

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' },
      });
    });

    return NextResponse.json({
      message: 'Transaction manually completed',
      transactionId: transaction.id,
      amount: transaction.amount
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to complete transaction',
      message: errorMessage
    }, { status: 500 });
  }
}

