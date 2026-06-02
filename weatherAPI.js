const API_KEY = '59f17cd5-491e-46a2-a748-61f32b480439';

export const getYandexWeather = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.weather.yandex.ru/v2/forecast?lat=${lat}&lon=${lon}&limit=1&hours=false`,
      {
        headers: {
          'X-Yandex-Weather-Key': API_KEY
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка получения погоды от Yandex:', error);
    return null;
  }
};

export const getWeatherEmoji = (condition) => {
  const cond = condition.toLowerCase();
  if (cond.includes('rain') || cond.includes('drizzle')) return '🌧️';
  if (cond.includes('snow')) return '❄️';
  if (cond.includes('clear')) return '☀️';
  if (cond.includes('clouds')) return '☁️';
  if (cond.includes('thunderstorm')) return '⛈️';
  if (cond.includes('mist') || cond.includes('fog')) return '🌫️';
  return '🌡️';
};