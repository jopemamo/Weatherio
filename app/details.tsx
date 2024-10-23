import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { getWeatherByLocation } from '@/services/weatherService'
import { getReadableWeatherDescription } from '@/services/weatherDescriptionService'

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

export default function WeatherDetail() {
  const { lat, lon, name } = useLocalSearchParams<{ lat: string, lon: string, name: string }>()
  const [weatherDetails, setWeatherDetails] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDetails = async () => {
    try {
      setLoading(true)
      const data = await getWeatherByLocation(+lat, +lon)
      setWeatherDetails(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
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
