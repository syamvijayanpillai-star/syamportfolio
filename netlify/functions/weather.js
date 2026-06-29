exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  const { lat, lon, q } = event.queryStringParameters || {};
  const OWM_KEY = process.env.OWM_API_KEY;
  const BASE = 'https://api.openweathermap.org/data/2.5';

  try {
    if (q && !lat && !lon) {
      const r = await fetch(`${BASE}/weather?q=${encodeURIComponent(q)}&appid=${OWM_KEY}&units=metric`);
      const d = await r.json();
      return { statusCode: 200, headers, body: JSON.stringify({
        temp: Math.round(d.main.temp), humidity: d.main.humidity,
        windSpeed: (d.wind.speed * 3.6).toFixed(1), windDeg: d.wind.deg,
        description: d.weather[0].description
      })};
    }

    if (!lat || !lon) return { statusCode: 400, headers, body: JSON.stringify({ error: 'COORDS_REQUIRED' }) };

    const [wr, ar] = await Promise.all([
      fetch(`${BASE}/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`),
      fetch(`${BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`)
    ]);
    
    const w = await wr.json();
    const a = ar.ok ? await ar.json() : null;

    return { statusCode: 200, headers, body: JSON.stringify({
      location: { city: w.name, country: w.sys.country },
      weather: {
        temp: Math.round(w.main.temp), feelsLike: Math.round(w.main.feels_like),
        humidity: w.main.humidity, pressure: w.main.pressure,
        windSpeed: (w.wind.speed * 3.6).toFixed(1), windDeg: w.wind.deg,
        description: w.weather[0].description
      },
      airQuality: a ? { aqi: a.list[0].main.aqi, components: a.list[0].components } : null
    })};
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'TELEMETRY_ERROR' }) };
  }
};