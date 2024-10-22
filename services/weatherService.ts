import { getCoordinates } from './locationService'

const BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?'

export const getWeatherByLocation = async (city: string) => {
  try {
    const {lat, lon} = await getCoordinates(city)
    const response = await fetch(`${BASE_URL}lat=${lat}&lon=${lon}`)

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    } else {
      throw new Error('An unknown error occurred')
    }
  }
};