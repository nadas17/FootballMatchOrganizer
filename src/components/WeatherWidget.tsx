import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, MapPin, Wind, Droplets, CloudSnow, AlertCircle } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  description: string;
}

interface WeatherWidgetProps {
  lat?: number;
  lng?: number;
  location?: string;
  className?: string;
}

// IMPORTANT: Move your API Key to an environment variable file (.env.local)
// For example, in a Vite project: VITE_OPENWEATHER_API_KEY='your_real_api_key'
// Then access it with: import.meta.env.VITE_OPENWEATHER_API_KEY
const API_KEY = '0bc4fb6a4a0537fb2d71e8f36ebbe3d1';

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ lat, lng, location, className = "" }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!lat || !lng) {
        setLoading(false);
        setError('Location information not found');
        return;
      }

      if (!API_KEY) {
         setLoading(false);
         setError('OpenWeatherMap API key is not set.');
         return;
      }

      try {
        // Use `lang=en` to get the description in English.
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&lang=en`
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Invalid API key. Please check your key.');
          }
          throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        setWeather({
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // API with units=metric gives m/s, convert to km/h
          location: location || data.name
        });
        setError(null);
      } catch (err) {
        console.error('Weather API error:', err);
        setError(err instanceof Error ? err.message : 'Could not retrieve weather information');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lng, location]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />;
      case 'clouds':
        return <Cloud className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />;
      case 'snow':
        return <CloudSnow className="w-8 h-8 sm:w-10 sm:h-10 text-blue-200" />;
      default:
        return <Cloud className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className={`weather-box flex items-center gap-2 rounded px-3 py-1 text-sm w-fit mx-auto ${className}`}>
        <span className="animate-pulse text-gray-300">Loading...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`weather-box flex items-center gap-2 rounded bg-red-500/20 px-3 py-1 text-xs w-fit mx-auto ${className}`}>
        <AlertCircle className="w-4 h-4 text-orange-300" />
        <span>{error || 'Weather unavailable'}</span>
      </div>
    );
  }

  // Maç kartı içindeki sade kutu
  return (
    <div className={`weather-box flex items-center gap-2 rounded px-3 py-1 text-sm w-fit mx-auto ${className}`}>
      {getWeatherIcon(weather.condition)}
      <span className="font-bold text-green-500">{weather.temperature}°C</span>
      <span className="font-bold capitalize text-green-500">{weather.description}</span>
    </div>
  );
};

export default WeatherWidget;
          <span><MapPin className="inline w-4 h-4 mr-1" />{weather.location}</span>
          <span><Droplets className="inline w-4 h-4 mr-1" />{weather.humidity}%</span>
          <span><Wind className="inline w-4 h-4 mr-1" />{weather.windSpeed} km/h</span>
        </div>
      </div>
    );
  }

  // Maç kartı içindeki sade kutu
  return (
    <div className={`weather-box flex items-center gap-2 rounded px-3 py-1 text-sm w-fit mx-auto ${className}`}>
      {getWeatherIcon(weather.condition)}
      <span className="font-bold text-green-500">{weather.temperature}°C</span>
      <span className="font-bold capitalize text-green-500">{weather.description}</span>
    </div>
  );
};

export default WeatherWidget;
