import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { getWeatherByLocation } from '@/services/weatherService'
import { getReadableWeatherDescription } from '@/services/weatherDescriptionService'
import { fetchSunriseSunset } from '@/services/sunService'

type WeatherData = {
  properties: {
    timeseries: {
      data: {
        instant: {
          details: {
            air_temperature: number
            wind_speed: number
            relative_humidity: number
          }
        }
        next_1_hours: {
          summary: {
            symbol_code: string
          }
        }
      }
    }[]
  }
}

type SunData = {
  properties: {
    sunrise: {
      time: string
      azimuth: number
    }
    sunset: {
      time: string
      azimuth: number
    }
    solarnoon: {
      time: string
      disc_centre_elevation: number
      visible: boolean
    }
    solarmidnight: {
      time: string
      disc_centre_elevation: number
      visible: boolean
    }
  }
}


export default function WeatherDetail() {
  const { lat, lon, name } = useLocalSearchParams<{ lat: string, lon: string, name: string }>()
  const [weatherDetails, setWeatherDetails] = useState<WeatherData | null>(null)
  const [sunData, setSunData] = useState<SunData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const data = await getWeatherByLocation(lat, lon)
      return data
    } catch (error) {
      console.error('Error fetching weather data:', error)
      throw new Error('Failed to fetch weather data')
    }
  }

  const fetchSunData = async (lat: number, lon: number) => {
    try {
      const sun = await fetchSunriseSunset(lat, lon, '+01:00')
      return sun
    } catch (error) {
      console.error('Error fetching sun data:', error)
      throw new Error('Failed to fetch sun data')
    }
  }

  const fetchDetails = async () => {
    setLoading(true)
    const weatherData = await fetchWeather(parseFloat(lat), parseFloat(lon))
    setWeatherDetails(weatherData)
    const sunData = await fetchSunData(parseFloat(lat), parseFloat(lon))
    setSunData(sunData)
    setLoading(false)
  }

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  useEffect(() => {
    fetchDetails()
  }, [lat, lon])

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!weatherDetails) {
    return (
      <View style={styles.container}>
        <Text>Error fetching weather data.</Text>
      </View>
    )
  }

  const weather = weatherDetails.properties.timeseries[0]

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{name}</Text>
      <Text>Weather: {getReadableWeatherDescription(weather.data.next_1_hours.summary.symbol_code)}</Text>
      <Text>Temperature: {weather.data.instant.details.air_temperature} °C</Text>
      <Text>Wind: {weather.data.instant.details.wind_speed} m/s</Text>
      <Text>Humidity: {weather.data.instant.details.relative_humidity} %</Text>

      { sunData && (
          <>
            <Text>Sunrise: {formatTime(sunData.properties.sunrise.time)}</Text>
            <Text>Sunset: {formatTime(sunData.properties.sunset.time)}</Text>
          </>
        )
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
})
