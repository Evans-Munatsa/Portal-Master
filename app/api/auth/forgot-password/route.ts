import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Return 200 even if user doesn't exist to prevent email enumeration
      return NextResponse.json({ message: 'If that email is registered, we have sent a password reset link.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry,
      },
    });

    // In a real application, you would send an email here.
    // For this demonstration, we'll log it and pretend.
    console.log(`[EMAIL SEND SIMULATION] To: ${user.email}`);
    console.log(`[EMAIL SEND SIMULATION] Subject: Password Reset`);
    console.log(`[EMAIL SEND SIMULATION] Body: Use this token to reset your password: ${resetToken}`);

    // Optionally we can return the token in dev environment for easier testing
    return NextResponse.json({ 
      message: 'If that email is registered, we have sent a password reset link.',
      _devToken: resetToken // Only exposing for demonstration in the UI
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process forgot password request' }, { status: 500 });
  }
}
