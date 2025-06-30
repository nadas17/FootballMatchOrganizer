import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  lat: number;
  lng: number;
  location?: string;
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ lat, lng, location, className = "" }) => {
  // Use environment variable for API key security
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!API_KEY) {
    return (
      <div className={`rounded-lg overflow-hidden border border-white/10 ${className}`}>
        <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-2 sm:p-3 border-b border-white/10">
          <div className="flex items-center gap-1 sm:gap-2 text-white">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-xs sm:text-sm truncate">
              {location || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
            </span>
          </div>
        </div>
        <div className="p-4 text-center text-white/70">
          <p>Map service temporarily unavailable</p>
        </div>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/embed/v1/view?key=${API_KEY}&center=${lat},${lng}&zoom=15&maptype=satellite`;
  
  return (
    <div className={`rounded-lg overflow-hidden border border-white/10 ${className}`}>
      <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-2 sm:p-3 border-b border-white/10">
        <div className="flex items-center gap-1 sm:gap-2 text-white">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold text-xs sm:text-sm truncate mobile-truncate">
            {location || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
          </span>
        </div>
      </div>
      <div className="w-full relative" style={{ paddingTop: "56.25%" }}> {/* 16:9 Aspect Ratio */}
        <iframe 
          title="Location Map"
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={googleMapsUrl}
        ></iframe>
      </div>
    </div>
  );
};

export default LocationMap;
