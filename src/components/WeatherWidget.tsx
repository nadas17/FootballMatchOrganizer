
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, MapPin, Thermometer, Wind, Droplets } from "lucide-react";

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
    // More realistic mock weather data
    const mockWeather = (): WeatherData => {
      const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      // More realistic temperature ranges for football weather
      let tempRange;
      const season = new Date().getMonth();
      
      if (season >= 3 && season <= 5) { // Spring
        tempRange = [12, 22];
      } else if (season >= 6 && season <= 8) { // Summer
        tempRange = [18, 28];
      } else if (season >= 9 && season <= 11) { // Autumn
        tempRange = [8, 18];
      } else { // Winter
        tempRange = [2, 12];
      }
      
      return {
        temperature: Math.floor(Math.random() * (tempRange[1] - tempRange[0] + 1)) + tempRange[0],
        condition: randomCondition,
        humidity: Math.floor(Math.random() * 30) + 45, // 45-75%
        windSpeed: Math.floor(Math.random() * 12) + 3, // 3-15 km/h
        location: location || `${lat?.toFixed(1)}°, ${lng?.toFixed(1)}°`
      };
    };

    const timer = setTimeout(() => {
      setWeather(mockWeather());
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [lat, lng, location]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'cloudy':
        return <Cloud className="w-4 h-4 text-gray-400" />;
      case 'partly cloudy':
        return <Cloud className="w-4 h-4 text-blue-300" />;
      case 'light rain':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      default:
        return <Cloud className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card className={`glass-card border-none shadow-sm ${className}`}>
        <CardContent className="p-3">
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-white/20 rounded w-2/3"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className={`glass-card border-none shadow-sm ${className}`}>
      <CardContent className="p-3">
        {/* Compact Header */}
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span className="text-white/70 text-xs font-medium truncate">{weather.location}</span>
        </div>
        
        {/* Main Weather Info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getWeatherIcon(weather.condition)}
            <div>
              <div className="text-lg font-bold text-white flex items-center gap-1">
                {weather.temperature}°C
              </div>
              <div className="text-white/70 text-xs">{weather.condition}</div>
            </div>
          </div>
        </div>
        
        {/* Compact Stats */}
        <div className="flex justify-between text-xs text-white/60">
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-green-400" />
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
