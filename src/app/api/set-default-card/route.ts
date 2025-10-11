import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, cardId } = await req.json();

    if (!email || !cardId) {
      return NextResponse.json(
        { error: "Email and card ID are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.savedCard.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });

    const card = await prisma.savedCard.update({
      where: { id: cardId },
      data: { isDefault: true },
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error("Error setting default card:", error);
    return NextResponse.json(
      { error: "Failed to set default card" },
      { status: 500 }
    );
  }
}

