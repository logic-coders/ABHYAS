import { NextResponse } from 'next/server';
import { getUserByEmail, updateUser } from '@/lib/db/user-store';
import { hashPassword } from '@/lib/utils/password';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: 'Invalid OTP or email' }, { status: 400 });
    }

    // Check OTP
    if (user.resetOtp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Check expiry
    if (!user.resetOtpExpiry || new Date() > new Date(user.resetOtpExpiry)) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user (clear OTP fields and update password)
    await updateUser(user.id, {
      passwordHash,
      resetOtp: undefined,
      resetOtpExpiry: undefined,
    });

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
