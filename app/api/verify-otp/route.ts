import { NextRequest, NextResponse } from 'next/server'
import { supabaseClient } from '@/lib/supabase/client'

// In-memory OTP store (should match send-otp route)
// In production, use Redis or database
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>()

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json()

    // Validate inputs
    if (!/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      )
    }

    // Get stored OTP
    const storedData = otpStore.get(phone)

    if (!storedData) {
      return NextResponse.json(
        { error: 'OTP expired or not found. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check expiry
    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(phone)
      return NextResponse.json(
        { error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check attempts (max 3 attempts)
    if (storedData.attempts >= 3) {
      otpStore.delete(phone)
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new OTP.' },
        { status: 400 }
      )
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1
      return NextResponse.json(
        { error: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.` },
        { status: 400 }
      )
    }

    // OTP verified successfully - remove from store
    otpStore.delete(phone)

    // Generate a session token (you can also create/sign in user here)
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36)

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      sessionToken,
      phone
    })

  } catch (error: any) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
