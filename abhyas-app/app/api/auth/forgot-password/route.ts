import { NextResponse } from 'next/server';
import { getUserByEmail, updateUser } from '@/lib/db/user-store';
import { Resend } from 'resend';

// Initialize Resend conditionally
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function generateOTP() {
  if (process.env.NODE_ENV !== 'production' && !resendApiKey) {
    return '123456'; // Hardcoded for local testing if no API key is provided
  }
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
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins from now

    await updateUser(user.id, {
      resetOtp: otp,
      resetOtpExpiry: expiry,
    });

    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Abhyas Admin <onboarding@resend.dev>', // Update this to your verified domain when in production
          to: user.email,
          subject: 'Your Abhyas Password Reset OTP',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaeb; border-radius: 8px;">
              <h2 style="color: #111;">Password Reset Request</h2>
              <p style="color: #444; font-size: 16px; line-height: 1.5;">Hello ${user.name},</p>
              <p style="color: #444; font-size: 16px; line-height: 1.5;">You requested a password reset. Use the OTP below to set a new password. This code will expire in 15 minutes.</p>
              <div style="background: #f4f4f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 6px; margin: 20px 0;">
                ${otp}
              </div>
              <p style="color: #777; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });

        if (error) {
          console.error('[RESEND] API returned an error:', error);
          console.log(`\n\n=========================================\n[DEV FALLBACK] FORGOT PASSWORD OTP for ${email}: ${otp}\n=========================================\n\n`);
        } else {
          console.log(`[RESEND] OTP successfully sent to ${email}`);
          // Still log it in development just in case it's helpful
          if (process.env.NODE_ENV !== 'production') {
            console.log(`\n\n=========================================\n[DEV] FORGOT PASSWORD OTP for ${email}: ${otp}\n=========================================\n\n`);
          }
        }
      } catch (emailError) {
        console.error('[RESEND] Failed to send email:', emailError);
        console.log(`\n\n=========================================\n[DEV FALLBACK] FORGOT PASSWORD OTP for ${email}: ${otp}\n=========================================\n\n`);
      }
    } else {
      // Simulate sending email (Development Only)
      console.log(`\n\n=========================================\n[DEV] FORGOT PASSWORD OTP for ${email}: ${otp}\n=========================================\n\n`);
    }

    return NextResponse.json({ message: 'If the email exists, an OTP has been sent.' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
