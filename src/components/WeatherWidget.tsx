import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Droplets, Wind, Sun, Cloud, CloudRain, CloudSnow, AlertCircle } from 'lucide-react';

interface WeatherWidgetProps {
  lat?: number;
  lng?: number;
  location?: string;
  className?: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

// Use environment variable for API key security
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

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
         setError('Weather service temporarily unavailable');
         return;
      }

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&lang=en`
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Weather service authentication failed');
          }
          throw new Error(`Weather service error: ${response.status}`);
        }

        const data = await response.json();
        
        setWeather({
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6),
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

  if (loading) {
    return (
      <Card className={`glass-card border-none shadow-sm ${className}`}>
        <CardContent className="p-2.5 sm:p-4">
          <div className="animate-pulse space-y-1.5 sm:space-y-2">
            <div className="h-3 sm:h-4 bg-white/20 rounded w-2/3"></div>
            <div className="h-5 sm:h-6 bg-white/20 rounded w-1/2"></div>
            <div className="h-2.5 sm:h-3 bg-white/20 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className={`glass-card border-none shadow-sm ${className} bg-red-500/20`}>
        <CardContent className="p-2.5 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-orange-300">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <div className="text-xs-mobile">
              {error || 'Could not load weather information'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card border-none shadow-sm ${className}`}>
      <CardContent className="p-2.5 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-white/80 text-xs sm:text-sm font-medium truncate mobile-truncate">{weather.location}</span>
        </div>
        
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-shrink-0">
              {getWeatherIcon(weather.condition)}
            </div>
            <div>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
                {weather.temperature}°C
              </div>
              <div className="text-white/70 text-xs-mobile capitalize">{weather.description}</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs-mobile text-white/70">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300 flex-shrink-0" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Wind className="w-3 h-3 sm:w-4 sm:h-4 text-green-300 flex-shrink-0" />
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
