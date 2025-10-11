import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { stripe, webhookSecret } from '@/lib/stripe';

export async function POST(req: Request) {
  console.log('[WEBHOOK] Webhook received');
  
  if (!webhookSecret) {
    console.error('[ERROR] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }
  
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('[ERROR] No stripe-signature header found');
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
    console.log('[SUCCESS] Webhook signature verified');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[ERROR] Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  console.log(`[INFO] Event type: ${event.type}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
        console.log(`[PAYMENT] PaymentIntent succeeded:`, {
          id: paymentIntentSucceeded.id,
          amount: paymentIntentSucceeded.amount,
          currency: paymentIntentSucceeded.currency,
          userId: paymentIntentSucceeded.metadata?.userId
        });

        const userId = paymentIntentSucceeded.metadata?.userId;

        if (!userId) {
          console.error('[ERROR] No userId found in payment intent metadata');
          return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
              balance: {
                increment: paymentIntentSucceeded.amount,
              },
            },
          });

          const updatedTransaction = await tx.transaction.update({
            where: { stripePaymentIntentId: paymentIntentSucceeded.id },
            data: { status: 'COMPLETED' },
          });

          console.log('[SUCCESS] Database updated:', {
            userId: updatedUser.id,
            newBalance: updatedUser.balance,
            transactionId: updatedTransaction.id,
            transactionStatus: updatedTransaction.status
          });
        });

        console.log('[SUCCESS] Payment processed successfully');
        break;

      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
        console.log(`[PAYMENT] PaymentIntent failed:`, {
          id: paymentIntentFailed.id,
          amount: paymentIntentFailed.amount
        });

        await prisma.transaction.update({
          where: { stripePaymentIntentId: paymentIntentFailed.id },
          data: { status: 'FAILED' },
        });

        console.log('[SUCCESS] Transaction marked as FAILED');
        break;

      default:
        console.log(`[INFO] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ERROR] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook', details: errorMessage },
      { status: 500 }
    );
  }
}
