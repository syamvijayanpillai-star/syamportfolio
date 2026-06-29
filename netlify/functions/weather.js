exports.handler = async (event, context) => {
  // Your API key is now hidden on the server — no one can see it
  const KEY = process.env.OPENWEATHER_KEY;
  const URL = `https://api.openweathermap.org/data/2.5/weather?q=Muscat&appid=${KEY}&units=metric`;

  try {
    const response = await fetch(URL);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch weather' })
    };
  }
};