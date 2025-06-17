
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, MapPin, Thermometer, Wind } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
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

  useEffect(() => {
    // Mock weather data since we don't have a weather API key
    const mockWeather = (): WeatherData => {
      const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Light Rain'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      return {
        temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
        condition: randomCondition,
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
        location: location || `${lat?.toFixed(2)}°, ${lng?.toFixed(2)}°`
      };
    };

    const timer = setTimeout(() => {
      setWeather(mockWeather());
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [lat, lng, location]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-6 h-6 text-yellow-400" />;
      case 'cloudy':
        return <Cloud className="w-6 h-6 text-gray-400" />;
      case 'light rain':
        return <CloudRain className="w-6 h-6 text-blue-400" />;
      default:
        return <Cloud className="w-6 h-6 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card className={`glass-card border-none shadow-lg ${className}`}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-8 bg-white/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className={`glass-card border-none shadow-lg ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span className="text-white/70 text-sm font-medium">{weather.location}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weather.condition)}
            <div>
              <div className="text-2xl font-bold text-white flex items-center gap-1">
                <Thermometer className="w-5 h-5 text-orange-400" />
                {weather.temperature}°C
              </div>
              <div className="text-white/70 text-sm">{weather.condition}</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-white/70">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Humidity: {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Wind className="w-3 h-3 text-green-400" />
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
