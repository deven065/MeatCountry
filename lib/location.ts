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
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MeatCountry App' // Required by Nominatim
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('Reverse geocoding data:', data)
        console.log('Address object:', data.address)
        const address = data.address
        
        // Get city name
        const city = address?.city || address?.town || address?.village || address?.municipality || 'Bangalore'
        
        // Try to extract detailed address from display_name
        // display_name format: "House, Street, Neighbourhood, Suburb, City, State, Postcode, Country"
        let detailedAddress = ''
        
        if (data.display_name) {
          // Split by comma and take first 3-4 parts (excluding city, state, country)
          const parts = data.display_name.split(',').map((p: string) => p.trim())
          console.log('Display name parts:', parts)
          
          // Find where the city starts and take everything before it
          const cityIndex = parts.findIndex((p: string) => p.toLowerCase().includes(city.toLowerCase()))
          if (cityIndex > 0) {
            detailedAddress = parts.slice(0, cityIndex).join(', ')
          } else {
            // Fallback: take first 2-3 parts
            detailedAddress = parts.slice(0, Math.min(3, parts.length - 3)).join(', ')
          }
        }
        
        // If display_name approach didn't work, build from address components
        if (!detailedAddress) {
          const parts = []
          if (address?.road) parts.push(address.road)
          if (address?.neighbourhood) parts.push(address.neighbourhood)
          else if (address?.suburb) parts.push(address.suburb)
          detailedAddress = parts.join(', ')
        }
        
        // Fallback to suburb/neighbourhood if still empty
        if (!detailedAddress) {
          detailedAddress = address?.suburb || address?.neighbourhood || address?.state_district || city
        }
        
        // Limit length to fit in UI
        if (detailedAddress.length > 50) {
          detailedAddress = detailedAddress.substring(0, 47) + '...'
        }
        
        // Return in format: "City|Full Address"
        const result = `${city}|${detailedAddress}`
        console.log('Location result:', result)
        return result
      }
    }
  } catch (error) {
    console.warn('Browser geolocation failed:', error)
  }

  // Fallback to IP-based location
  try {
    const response = await fetch('/api/location')
    const data = await response.json()
    return `${data.city}|${data.city}`
  } catch (error) {
    console.error('IP geolocation failed:', error)
  }

  return 'Bangalore|Bangalore'
}
