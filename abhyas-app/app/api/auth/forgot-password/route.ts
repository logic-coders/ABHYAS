import { NextResponse } from 'next/server';
import { getUserByEmail, updateUser } from '@/lib/user-store';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      // Don't leak whether the email exists, just say successful
      return NextResponse.json({ message: 'If the email exists, an OTP has been sent.' }, { status: 200 });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins from now

    await updateUser(user.id, {
      resetOtp: otp,
      resetOtpExpiry: expiry,
    });

    // Simulate sending email (Development Only)
    console.log(`\n\n=========================================\n[DEV] FORGOT PASSWORD OTP for ${email}: ${otp}\n=========================================\n\n`);

    return NextResponse.json({ message: 'If the email exists, an OTP has been sent.', simulatedOtp: otp }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
