import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Get client IP from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'

    console.log('Detected IP:', ip)

    // For development/localhost, try to use a public IP detection service
    if (ip === 'unknown' || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.')) {
      try {
        // Try to get public IP from ipify
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        const publicIp = ipData.ip
        
        console.log('Public IP from ipify:', publicIp)
        
        // Now use this public IP for geolocation
        const geoResponse = await fetch(`https://ipapi.co/${publicIp}/json/`)
        
        if (geoResponse.ok) {
          const geoData = await geoResponse.json()
          console.log('Geolocation data:', geoData)
          
          return NextResponse.json({
            city: geoData.city || 'Bangalore',
            country: geoData.country_name || 'India',
            region: geoData.region,
            isDefault: false
          })
        }
      } catch (error) {
        console.error('Failed to detect public IP:', error)
      }
      
      // If all fails, return default
      return NextResponse.json({ 
        city: 'Bangalore',
        country: 'India',
        isDefault: true 
      })
    }

    // Use ipapi.co for IP geolocation (free tier: 1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error('Failed to fetch location')
    }

    const data = await response.json()
    console.log('Geolocation data:', data)

    return NextResponse.json({
      city: data.city || 'Bangalore',
      country: data.country_name || 'India',
      region: data.region,
      isDefault: false
    })
  } catch (error) {
    console.error('Location API error:', error)
    // Fallback to default location
    return NextResponse.json({ 
      city: 'Bangalore',
      country: 'India',
      isDefault: true 
    })
  }
}
