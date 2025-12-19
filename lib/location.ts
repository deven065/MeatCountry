export async function getUserLocation(): Promise<string> {
  try {
    // Try browser's Geolocation API first
    if ('geolocation' in navigator) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 300000 // Cache for 5 minutes
        })
      })

      // Use OpenStreetMap's Nominatim for reverse geocoding (free, no API key needed)
      const { latitude, longitude } = position.coords
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
        {
          headers: {
            'User-Agent': 'MeatCountry App' // Required by Nominatim
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        const city = data.address?.city || 
                     data.address?.town || 
                     data.address?.village || 
                     data.address?.municipality ||
                     'Bangalore'
        return city
      }
    }
  } catch (error) {
    console.warn('Browser geolocation failed:', error)
  }

  // Fallback to IP-based location
  try {
    const response = await fetch('/api/location')
    const data = await response.json()
    return data.city
  } catch (error) {
    console.error('IP geolocation failed:', error)
  }

  return 'Bangalore'
}
