import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import * as Location from 'expo-location'
import { getWeatherByLocation } from '../services/weatherService'
import { FIXED_LOCATIONS, DEFAULT_LOCATION } from '../constants/Locations'

type WeatherData = {
  properties: {
    timeseries: {
      data: {
        instant: {
          details: {
            air_temperature: number
          }
        }
      }
    }[]
  }
}

type WeatherState = {
  name: string
  weather: WeatherData | null
  error: string | null
}

export default function Dashboard() {
  const [weathers, setWeathers] = useState<WeatherState[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWeatherData = async (location: { lat: number; lon: number }, name: string): Promise<WeatherState> => {
    try {
      const weatherData = await getWeatherByLocation(location.lat, location.lon)
      return { name, weather: weatherData, error: null }
    } catch (error) {
      return { name, weather: null, error: `Failed to fetch weather for ${name}` }
    }
  }

  const fetchAllWeathers = async () => {
    setLoading(true)

    // User location weather
    const userWeatherPromise = (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === 'granted') {
          const userLocation = await Location.getCurrentPositionAsync({})
          const { latitude, longitude } = userLocation.coords
          return await fetchWeatherData({ lat: latitude, lon: longitude }, 'Your Location')
        } else {
          // Fallback to default location if there is no permission for the location
          const { name, lat, lon } = DEFAULT_LOCATION
          return await fetchWeatherData({ lat, lon }, name)
        }
      } catch (error) {
        return { name: 'Your Location', weather: null, error: 'Failed to fetch weather for your location'}
      }
    })()

    // Fixed locations weather
    const fixedWeatherPromises = FIXED_LOCATIONS.map((location) =>
      fetchWeatherData({ lat: location.lat, lon: location.lon }, location.name)
    )

    const resolvedWeathers = await Promise.all([userWeatherPromise, ...fixedWeatherPromises])
    setWeathers(resolvedWeathers)
    setLoading(false)
  }

  useEffect(() => {
    fetchAllWeathers()
  }, [])

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" testID="loading-test" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {weathers.map((location) => (
        <View key={location.name}>
          <Text style={styles.header}>{location.name}</Text>
          {location.weather ? (
            <Text>
              Temperature: {location.weather.properties.timeseries[0].data.instant.details.air_temperature} °C
            </Text>
          ) : (
            <Text>{location.error}</Text>
          )}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
})
