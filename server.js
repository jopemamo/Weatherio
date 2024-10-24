const express = require('express')
const fetch = require('node-fetch')

const app = express()

const BASE_URL = 'https://api.met.no/weatherapi/sunrise/3.0/sun'

app.get('/api/sunrise-sunset', async (req, res) => {
  const { lat, lon, offset } = req.query
  const date = new Date().toISOString().split('T')[0]

  try {
    const response = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&date=${date}&offset=${offset}`, {
      headers: {
        'User-Agent': 'https://github.com/jopemamo',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch sun data')
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error fetching sun data:', error)
    res.status(500).send('Failed to fetch data')
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`)
})
