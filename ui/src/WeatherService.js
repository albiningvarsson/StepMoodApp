export const fetchWeather = async (lat, lon, date) => {
  // Om inget datum skickas med, använd dagens datum
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  // Vi använder "customer-archive" eller forecast-api med historik
  // Notera: Open-Meteo Forecast API stöder upp till 92 dagar bakåt gratis!
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${targetDate}&end_date=${targetDate}&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Eftersom vi hämtar "daily" data får vi listor, vi tar första elementet [0]
    return {
      temperature: data.daily.temperature_2m_max[0],
      rain: data.daily.precipitation_sum[0],
      windSpeed: data.daily.wind_speed_10m_max[0],
      weatherCode: data.daily.weather_code[0]
    };
  } catch (error) {
    console.error("Kunde inte hämta historiskt väder:", error);
    return null;
  }
};