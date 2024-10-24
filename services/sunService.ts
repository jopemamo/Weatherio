
const PROXY_URL = 'http://localhost:3001/api/sunrise-sunset';

export async function fetchSunriseSunset(lat: number, lon: number, offset: string) {

  const date = new Date().toISOString().split('T')[0];

  try {
    const response = await fetch(`${PROXY_URL}?lat=${lat}&lon=${lon}&date=${date}&offset=${offset}`)
    if (!response.ok) {
      throw new Error('Failed to fetch sun data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sun data:', error);
    throw error;
  }
}

