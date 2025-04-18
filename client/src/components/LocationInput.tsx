import React, { useState, ChangeEvent } from 'react';

interface LocationInputProps {
  location: { lat: string; lon: string };
  onLocationChange: (location: { lat: string; lon: string }) => void;
}

function LocationInput({ location, onLocationChange }: LocationInputProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualChange = (e: ChangeEvent<HTMLInputElement>) => {
    onLocationChange({ ...location, [e.target.name]: e.target.value });
    setError(null); // Clear error on manual input
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationChange({ lat: latitude.toFixed(4), lon: longitude.toFixed(4) });
        setIsLocating(false);
      },
      (err) => {
        setError(`Failed to get location: ${err.message}`);
        setIsLocating(false);
      },
      { timeout: 10000 } // Add timeout
    );
  };

  return (
    <div className="p-5 border rounded-lg shadow-md bg-white">
       <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">2. Your Location</h3>
        <p className="text-sm text-gray-600 mb-3">Needed to fetch accurate solar irradiance data (using PVGIS).</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <input
                type="number"
                step="any"
                name="lat"
                placeholder="Latitude (e.g., -1.286)"
                value={location.lat}
                onChange={handleManualChange}
                required
                className="p-2 border rounded w-full shadow-inner"
                aria-label="Latitude"
            />
            <input
                type="number"
                step="any"
                name="lon"
                placeholder="Longitude (e.g., 36.817)"
                value={location.lon}
                onChange={handleManualChange}
                required
                className="p-2 border rounded w-full shadow-inner"
                aria-label="Longitude"
            />
             <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
                {isLocating ? 'Locating...' : 'Get My Location'}
            </button>
        </div>
         {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}

export default LocationInput; 