
import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  lat: number;
  lng: number;
  location?: string;
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ lat, lng, location, className = "" }) => {
  // Use the API key from Supabase secrets (same as in the script)
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/view?key=AIzaSyASlSPjEVAHrRx1hy0KOltskpiV6cY_zyQ&center=${lat},${lng}&zoom=15&maptype=satellite`;
  
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
      <div className="relative">
        <iframe
          src={googleMapsUrl}
          width="100%"
          height="150"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full sm:h-[200px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        
        {/* Google Maps link overlay */}
        <div className="absolute bottom-2 right-2">
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/90 hover:bg-white text-gray-800 px-2 py-1 rounded text-xs font-medium transition-colors"
          >
            Open in Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
