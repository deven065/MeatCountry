import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>()

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(phone)
    }
  }
}, 5 * 60 * 1000)

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    // Validate phone number
    if (!/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Must be 10 digits.' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP with 5-minute expiry
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    })

    // Send SMS via free provider
    const smsSent = await sendSMS(phone, otp)

    if (!smsSent) {
      return NextResponse.json(
        { error: 'Failed to send SMS. Please try again or use email OTP.' },
        { status: 500 }
      )
    }

    console.log(`OTP sent to ${phone}: ${otp}`) // Remove in production

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully'
    })

  } catch (error: any) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 500 }
    )
  }
}

async function sendSMS(phone: string, otp: string): Promise<boolean> {
  const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY
  
  console.log('🔍 Fast2SMS Debug:')
  console.log('- Environment:', process.env.NODE_ENV)
  console.log('- API Key exists:', !!FAST2SMS_API_KEY)
  console.log('- API Key length:', FAST2SMS_API_KEY?.length || 0)
  
  // Development mode: Log OTP to console if no API key
  if (process.env.NODE_ENV === 'development' && !FAST2SMS_API_KEY) {
    console.log('\n=================================')
    console.log('📱 SMS OTP (Development Mode)')
    console.log(`Phone: ${phone}`)
    console.log(`OTP: ${otp}`)
    console.log('=================================\n')
    return true // Simulate success in dev
  }
  
  if (!FAST2SMS_API_KEY) {
    console.error('❌ Fast2SMS API key not configured. Please add FAST2SMS_API_KEY to .env.local')
    return false
  }

  try {
    console.log(`📤 Sending SMS to ${phone}...`)
    
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'otp',
        sender_id: 'FSTSMS',
        message: `Your MeatCountry OTP is ${otp}. Valid for 5 minutes.`,
        variables_values: otp,
        flash: 0,
        numbers: phone
      })
    })

    const data = await response.json()
    console.log('📥 Fast2SMS Response:', JSON.stringify(data, null, 2))
    
    if (data.return === true) {
      console.log(`✅ SMS sent successfully to ${phone}`)
      return true
    } else {
      console.error('❌ Fast2SMS error:', data)
      return false
    }
  } catch (error) {
    console.error('❌ Fast2SMS exception:', error)
    return false
  }
}
