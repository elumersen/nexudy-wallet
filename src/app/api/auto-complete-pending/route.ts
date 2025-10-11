import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST() {
  try {
    const pendingTransactions = await prisma.transaction.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    if (pendingTransactions.length === 0) {
      return NextResponse.json({ 
        message: 'No pending transactions',
        completed: 0 
      });
    }

    let completed = 0;

    for (const transaction of pendingTransactions) {
      if (!transaction.stripePaymentIntentId) continue;

      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          transaction.stripePaymentIntentId
        );

        if (paymentIntent.status === 'succeeded') {
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

          completed++;
        } else if (paymentIntent.status === 'canceled' || paymentIntent.status === 'failed') {
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'FAILED' },
          });
        }
      } catch (error) {
        console.error(`Error processing transaction ${transaction.id}:`, error);
      }
    }

    return NextResponse.json({ 
      message: `Completed ${completed} pending transactions`,
      completed 
    });
  } catch (error) {
    console.error('Error auto-completing transactions:', error);
    return NextResponse.json({ 
      error: 'Failed to process pending transactions' 
    }, { status: 500 });
  }
}

