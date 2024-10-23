
const BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?'

export const getWeatherByLocation = async (lat: number, lon: number) => {
  try {
    const response = await fetch(`${BASE_URL}lat=${lat}&lon=${lon}`)

    if (!response.ok) {
      throw new Error(`Unable to get the weather forecast: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    } else {
      throw new Error('An unknown error occurred')
    }
  }
}
