
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, MapPin, Thermometer, Wind, Droplets, CloudSnow, AlertCircle } from "lucide-react";

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

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ lat, lng, location, className = "" }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!lat || !lng) {
        setLoading(false);
        setError('Konum bilgisi bulunamadı');
        return;
      }

      try {
        // You need to get a valid OpenWeatherMap API key from https://openweathermap.org/api
        const API_KEY = 'YOUR_VALID_API_KEY_HERE'; // Please replace with a valid API key
        
        if (API_KEY === 'YOUR_VALID_API_KEY_HERE') {
          setError('API anahtarı yapılandırılmamış');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&lang=tr`
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Geçersiz API anahtarı - lütfen geçerli bir OpenWeatherMap API anahtarı kullanın');
          }
          throw new Error(`Hava durumu API hatası: ${response.status}`);
        }

        const data = await response.json();
        console.log('Weather API response:', data);
        
        setWeather({
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
          location: location || data.name
        });
        setError(null);
      } catch (err) {
        console.error('Weather API error:', err);
        setError(err instanceof Error ? err.message : 'Hava durumu bilgisi alınamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lng, location]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />;
      case 'clouds':
        return <Cloud className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />;
      case 'snow':
        return <CloudSnow className="w-3 h-3 sm:w-4 sm:h-4 text-blue-200" />;
      default:
        return <Cloud className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card className={`glass-card border-none shadow-sm ${className}`}>
        <CardContent className="p-2 sm:p-3">
          <div className="animate-pulse space-y-1 sm:space-y-2">
            <div className="h-2 sm:h-3 bg-white/20 rounded w-2/3"></div>
            <div className="h-3 sm:h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className={`glass-card border-none shadow-sm ${className}`}>
        <CardContent className="p-2 sm:p-3">
          <div className="flex items-center gap-1 sm:gap-2 text-orange-400">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <div className="text-xs">
              {error || 'Hava durumu bilgisi yüklenemedi'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card border-none shadow-sm ${className}`}>
      <CardContent className="p-2 sm:p-3">
        {/* Compact Header */}
        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 flex-shrink-0" />
          <span className="text-white/70 text-xs font-medium truncate">{weather.location}</span>
        </div>
        
        {/* Main Weather Info */}
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {getWeatherIcon(weather.condition)}
            <div>
              <div className="text-sm sm:text-lg font-bold text-white flex items-center gap-1">
                {weather.temperature}°C
              </div>
              <div className="text-white/70 text-xs capitalize">{weather.description}</div>
            </div>
          </div>
        </div>
        
        {/* Compact Stats */}
        <div className="flex justify-between text-xs text-white/60">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Droplets className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Wind className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400" />
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
