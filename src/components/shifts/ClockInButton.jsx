import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, MapPin, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const ALLOWED_RADIUS_METERS = 500;

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodeVenue(venueName, location, address) {
  const query = address
    ? `${address}`
    : `${venueName}, ${location}, Ireland`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

export default function ClockInButton({ shift }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const isClockedIn = !!shift.clock_in_time;
  const isClockedOut = !!shift.clock_out_time;

  const handleClock = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    try {
      // Get user position
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );

      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Geocode venue
      const venueCoords = await geocodeVenue(
        shift.venue_name,
        shift.location,
        shift.venue_address
      );

      if (!venueCoords) {
        toast.error("Could not locate the venue. Please contact your employer.");
        setLoading(false);
        return;
      }

      const distance = haversineDistance(
        userLat,
        userLng,
        venueCoords.lat,
        venueCoords.lng
      );

      if (distance > ALLOWED_RADIUS_METERS) {
        toast.error(
          `You must be within ${ALLOWED_RADIUS_METERS}m of the venue. You are ${Math.round(distance)}m away.`
        );
        setLoading(false);
        return;
      }

      const now = new Date().toISOString();

      if (!isClockedIn) {
        await base44.entities.Shift.update(shift.id, { clock_in_time: now });
        toast.success(`Clocked in at ${format(new Date(now), "HH:mm")}`);
      } else {
        await base44.entities.Shift.update(shift.id, { clock_out_time: now });
        toast.success(`Clocked out at ${format(new Date(now), "HH:mm")}`);
      }

      queryClient.invalidateQueries({ queryKey: ["myShifts"] });
    } catch (err) {
      if (err.code === 1) {
        toast.error("Location access denied. Please allow location to clock in.");
      } else if (err.code === 2) {
        toast.error("Location unavailable. Try again.");
      } else if (err.code === 3) {
        toast.error("Location request timed out. Try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isClockedIn && isClockedOut) {
    return (
      <div className="flex flex-col gap-1 p-3 rounded-xl text-sm" style={{ backgroundColor: '#8A9B8E15', color: 'var(--sage)' }}>
        <div className="flex items-center gap-2 font-normal">
          <LogIn className="w-4 h-4" />
          Clocked in: {format(new Date(shift.clock_in_time), "HH:mm")}
        </div>
        <div className="flex items-center gap-2 font-normal">
          <LogOut className="w-4 h-4" />
          Clocked out: {format(new Date(shift.clock_out_time), "HH:mm")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isClockedIn && (
        <div className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: '#8A9B8E15', color: 'var(--sage)' }}>
          <LogIn className="w-4 h-4" />
          <span>Clocked in at {format(new Date(shift.clock_in_time), "HH:mm")}</span>
        </div>
      )}
      <Button
        onClick={handleClock}
        disabled={loading}
        className="w-full rounded-xl font-normal flex items-center gap-2"
        style={
          isClockedIn
            ? { backgroundColor: 'var(--earth)', color: 'white' }
            : { backgroundColor: 'var(--sage)', color: 'white' }
        }
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isClockedIn ? (
          <LogOut className="w-4 h-4" />
        ) : (
          <LogIn className="w-4 h-4" />
        )}
        {loading
          ? "Checking location..."
          : isClockedIn
          ? "Clock Out"
          : "Clock In"}
      </Button>
      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--clay)' }}>
        <MapPin className="w-3 h-3" />
        Must be within {ALLOWED_RADIUS_METERS}m of {shift.venue_name}
      </div>
    </div>
  );
}