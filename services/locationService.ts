export const getCoordinates = async (location: string) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${location}&format=json`
    )

    if (!response.ok) {
      throw new Error(`Unable to find the coordinates: ${response.status}`)
    }

    const data = await response.json()

    if (data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon }
    } else {
      throw new Error('Location not found')
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error)
    throw error
  }
};

