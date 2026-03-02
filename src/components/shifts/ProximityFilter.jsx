import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, X } from "lucide-react";

export default function ProximityFilter({ userLocation, onLocationSet, onLocationClear, proximityKm, onProximityChange }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationSet({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError("Could not get your location. Please allow location access.");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const radiusOptions = [5, 10, 20, 50];

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl mb-6" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
      <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--terracotta)', strokeWidth: 1.5 }} />

      {!userLocation ? (
        <>
          <span className="text-sm font-light" style={{ color: 'var(--clay)' }}>
            Filter shifts by distance from you
          </span>
          <Button
            onClick={detectLocation}
            disabled={loading}
            size="sm"
            className="rounded-xl font-normal text-xs tracking-wide"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Detecting...</>
            ) : (
              <><MapPin className="w-3.5 h-3.5 mr-1.5" /> Use My Location</>
            )}
          </Button>
          {error && <span className="text-xs" style={{ color: 'var(--clay)' }}>{error}</span>}
        </>
      ) : (
        <>
          <span className="text-sm font-light" style={{ color: 'var(--earth)' }}>
            Within
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {radiusOptions.map(km => (
              <button
                key={km}
                onClick={() => onProximityChange(km)}
                className="px-3 py-1.5 rounded-xl text-xs font-normal transition-all"
                style={{
                  backgroundColor: proximityKm === km ? 'var(--terracotta)' : 'var(--sand)',
                  color: proximityKm === km ? 'white' : 'var(--earth)'
                }}
              >
                {km}km
              </button>
            ))}
          </div>
          <span className="text-sm font-light" style={{ color: 'var(--earth)' }}>
            of your location
          </span>
          <button
            onClick={onLocationClear}
            className="ml-auto p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--clay)' }}
            title="Clear location filter"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}