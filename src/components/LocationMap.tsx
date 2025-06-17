
import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  lat: number;
  lng: number;
  location?: string;
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ lat, lng, location, className = "" }) => {
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/view?key=AIzaSyASlSPjEVAHrRx1hy0KOltskpiV6cY_zyQ&center=${lat},${lng}&zoom=15`;
  
  return (
    <div className={`rounded-lg overflow-hidden border border-white/10 ${className}`}>
      <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-white">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-sm">
            {location || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
          </span>
        </div>
      </div>
      <div className="relative">
        <iframe
          src={googleMapsUrl}
          width="100%"
          height="200"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default LocationMap;
