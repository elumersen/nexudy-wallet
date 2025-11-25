import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    // Handle both old base64 passwords and new bcrypt hashes for migration
    let passwordValid = false;
    
    // Check if password is stored as bcrypt hash (starts with $2a$ or $2b$)
    if (user.password.startsWith('$2')) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy: check base64 encoding for existing users
      const base64Password = Buffer.from(password).toString('base64');
      passwordValid = user.password === base64Password;
      
      // If valid with old method, upgrade to bcrypt hash
      if (passwordValid) {
        const newHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash },
        });
      }
    }
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error("Error signing in:", error);
    return NextResponse.json(
      { error: "Failed to sign in" },
      { status: 500 }
    );
  }
}

