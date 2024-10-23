import { render, waitFor, screen } from '@testing-library/react-native'
import Dashboard from '@/app/index'
import * as Location from 'expo-location'
import { getWeatherByLocation } from '@/services/weatherService'
import { FIXED_LOCATIONS, DEFAULT_LOCATION } from '@/constants/Locations'

jest.mock('expo-location')
jest.mock('@/services/weatherService', () => ({
  getWeatherByLocation: jest.fn(),
}))

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading spinner', () => {
    render(<Dashboard />)
    expect(screen.getByTestId('loading-test')).toBeTruthy()
  })

  it('fetches and displays weather for user location and fixed locations', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 40.71, longitude: -74.00 },
    })

    const mockWeatherData = {
      properties: {
        timeseries: [{ data: { instant: { details: { air_temperature: 10 } } } }],
      },
    };

    (getWeatherByLocation as jest.Mock)
      .mockResolvedValueOnce(mockWeatherData)
      .mockResolvedValueOnce(mockWeatherData)
      .mockResolvedValueOnce(mockWeatherData)

    render(<Dashboard />);

    await waitFor(() => expect(getWeatherByLocation).toHaveBeenCalledTimes(FIXED_LOCATIONS.length + 1))
    expect(screen.getByText('Your Location')).toBeTruthy()
    expect(screen.getAllByText('Temperature: 10 °C')).toHaveLength(3)
  })

  it('displays weather for default location when location permission is denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' })

    const mockDefaultWeatherData = {
      properties: {
        timeseries: [{ data: { instant: { details: { air_temperature: 8 } } } }],
      },
    };

    (getWeatherByLocation as jest.Mock).mockResolvedValueOnce(mockDefaultWeatherData)

    const mockFixedWeatherData = {
      properties: {
        timeseries: [{ data: { instant: { details: { air_temperature: 12 } } } }],
      },
    };

    (getWeatherByLocation as jest.Mock).mockResolvedValueOnce(mockFixedWeatherData);
    (getWeatherByLocation as jest.Mock).mockResolvedValueOnce(mockFixedWeatherData);

    render(<Dashboard />)

    await waitFor(() => expect(screen.getByText(DEFAULT_LOCATION.name)).toBeTruthy())
    expect(screen.getAllByText('Temperature: 8 °C')).toHaveLength(1)
    expect(screen.getAllByText('Temperature: 12 °C')).toHaveLength(2)
  })

  it('displays weather for fixed locations even when user location fails', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Location service error'))

    const mockWeatherData = {
      properties: {
        timeseries: [{ data: { instant: { details: { air_temperature: 15 } } } }],
      },
    };

    FIXED_LOCATIONS.forEach(() => {
      (getWeatherByLocation as jest.Mock).mockResolvedValueOnce(mockWeatherData);
    })

    render(<Dashboard />)

    await waitFor(() => expect(screen.getByText('Your Location')).toBeTruthy())

    expect(screen.getByText('Failed to fetch weather for your location')).toBeTruthy()
    expect(screen.getAllByText('Temperature: 15 °C')).toHaveLength(2)
    FIXED_LOCATIONS.forEach(location => {
      expect(screen.getByText(location.name)).toBeTruthy()
    })
  })

  it('displays an error message for fixed locations when fetch fails', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 40.71, longitude: -74.00 },
    });

    (getWeatherByLocation as jest.Mock)
      .mockResolvedValueOnce({
        properties: {
          timeseries: [{ data: { instant: { details: { air_temperature: 10 } } } }],
        },
      })
      .mockRejectedValueOnce(new Error('Weather API error'))
      .mockResolvedValueOnce({
        properties: {
          timeseries: [{ data: { instant: { details: { air_temperature: 15 } } } }],
        },
      })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Your Location')).toBeTruthy();
      expect(screen.getAllByText('Temperature: 10 °C')).toHaveLength(1);
      expect(screen.getByText('Failed to fetch weather for Lisbon')).toBeTruthy();
    })
  })
})
