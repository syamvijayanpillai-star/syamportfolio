exports.handler = async (event, context) => {
  const KEY = process.env.OPENWEATHER_KEY;
  
  // Get lat/lon from query parameters
  const { lat, lon } = event.queryStringParameters || {};
  
  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing lat/lon parameters' })
    };
  }

  try {
    // Fetch both weather and pollution in parallel
    const [weatherRes, pollutionRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${KEY}`)
    ]);

    const weather = await weatherRes.json();
    const pollution = await pollutionRes.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ weather, pollution })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch weather data' })
    };
  }
};