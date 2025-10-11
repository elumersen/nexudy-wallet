import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { savedCards: true },
    });

    if (!user) {
      return NextResponse.json({ savedCards: [] });
    }

    return NextResponse.json({ savedCards: user.savedCards });
  } catch (error) {
    console.error("Error fetching saved cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved cards" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, paymentMethodId } = await req.json();

    if (!email || !paymentMethodId) {
      return NextResponse.json(
        { error: "Email and payment method ID are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (!paymentMethod.card) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    const existingCards = await prisma.savedCard.findMany({
      where: { userId: user.id },
    });

    const isFirstCard = existingCards.length === 0;

    const savedCard = await prisma.savedCard.create({
      data: {
        userId: user.id,
        stripePaymentMethodId: paymentMethodId,
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
        isDefault: isFirstCard,
      },
    });

    return NextResponse.json({ savedCard });
  } catch (error) {
    console.error("Error saving card:", error);
    return NextResponse.json(
      { error: "Failed to save card" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cardId = req.nextUrl.searchParams.get("cardId");
    const email = req.nextUrl.searchParams.get("email");

    if (!cardId || !email) {
      return NextResponse.json(
        { error: "Card ID and email are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const card = await prisma.savedCard.findUnique({
      where: { id: cardId },
    });

    if (!card || card.userId !== user.id) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    await stripe.paymentMethods.detach(card.stripePaymentMethodId);

    await prisma.savedCard.delete({
      where: { id: cardId },
    });

    if (card.isDefault) {
      const remainingCards = await prisma.savedCard.findMany({
        where: { userId: user.id },
      });

      if (remainingCards.length > 0) {
        await prisma.savedCard.update({
          where: { id: remainingCards[0].id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}

