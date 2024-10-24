import { forwardRef } from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'

type LocationCardProps = {
  name: string
  temperature: number | null
  error: string | null
  onPress?: () => void
}

const LocationCard = forwardRef<TouchableOpacity, LocationCardProps>(({ name, temperature, error, onPress }, ref) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} ref={ref}>
      <Text style={styles.location}>{name}</Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.temperature}>Temperature: {temperature} °C</Text>
      )}
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
    width: '100%',
  },
  location: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  temperature: {
    fontSize: 16,
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
})

export default LocationCard
