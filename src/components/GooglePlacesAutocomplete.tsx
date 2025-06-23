
import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: { name: string; lat: number; lng: number }) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  onPlaceSelect,
  value,
  onChange,
  placeholder = "Search for a location...",
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
        return;
      }

      // Check if script is already added
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        window.initGoogleMaps = () => {
          setIsLoaded(true);
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyASlSPjEVAHrRx1hy0KOltskpiV6cY_zyQ&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      } else {
        // Script already exists, check if Google Maps is loaded
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsLoaded(true);
            clearInterval(checkGoogle);
          }
        }, 100);
      }
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      console.log('Initializing Google Places Autocomplete');
      
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        fields: ['place_id', 'geometry', 'name', 'formatted_address']
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        console.log('Place selected:', place);
        
        if (place.geometry && place.geometry.location) {
          const location = {
            name: place.formatted_address || place.name || '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          console.log('Location data:', location);
          onPlaceSelect(location);
          onChange(location.name);
        }
      });
    }
  }, [isLoaded, onPlaceSelect, onChange]);

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
        <MapPin className="w-4 h-4 text-orange-400" />
      </div>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isLoaded ? placeholder : "Loading location services..."}
        className={`pl-10 ${className}`}
        disabled={!isLoaded}
      />
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;
