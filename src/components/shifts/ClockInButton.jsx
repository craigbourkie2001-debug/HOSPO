import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Loader2, MapPin, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getDistanceKm, getLocationCoords } from "./geoUtils";
import { useQueryClient } from "@tanstack/react-query";

const CLOCK_IN_RADIUS_KM = 0.5; // 500 metres

export default function ClockInButton({ shift }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const isClockedIn = !!shift.clocked_in_at;
  const isClockedOut = !!shift.clocked_out_at;

  const getPosition = () =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      })
    );

  const checkProximity = (position) => {
    const venueCoords = getLocationCoords(shift.location);
    if (!venueCoords) {
      // Can't determine venue coords — allow clock-in with a warning
      return { allowed: true, distance: null };
    }
    const dist = getDistanceKm(
      position.coords.latitude,
      position.coords.longitude,
      venueCoords.lat,
      venueCoords.lng
    );
    return { allowed: dist <= CLOCK_IN_RADIUS_KM, distance: dist };
  };

  const handleClock = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    try {
      const position = await getPosition();
      const { allowed, distance } = checkProximity(position);

      if (!allowed) {
        const distM = Math.round(distance * 1000);
        toast.error(
          `You must be within 500m of ${shift.venue_name} to clock ${isClockedIn ? "out" : "in"}. You are ${distM}m away.`
        );
        return;
      }

      const now = new Date().toISOString();
      if (!isClockedIn) {
        await base44.entities.Shift.update(shift.id, { clocked_in_at: now });
        toast.success(`Clocked in at ${shift.venue_name}!`);
      } else {
        await base44.entities.Shift.update(shift.id, { clocked_out_at: now });
        toast.success(`Clocked out. Great shift!`);
      }

      queryClient.invalidateQueries({ queryKey: ["myShifts"] });
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
    } catch (err) {
      if (err.code === 1) {
        toast.error("Location permission denied. Please allow location access to clock in.");
      } else if (err.code === 2) {
        toast.error("Unable to determine your location. Please try again.");
      } else if (err.code === 3) {
        toast.error("Location request timed out. Please try again.");
      } else {
        toast.error("Failed to clock in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isClockedOut) {
    return (
      <div
        className="flex items-center gap-2 p-3 rounded-xl text-sm"
        style={{ backgroundColor: "#8A9B8E15", color: "var(--sage)" }}
      >
        <LogOut className="w-4 h-4" />
        Clocked out
      </div>
    );
  }

  return (
    <Button
      onClick={handleClock}
      disabled={loading}
      className="w-full rounded-xl font-normal flex items-center gap-2"
      style={
        isClockedIn
          ? { backgroundColor: "var(--earth)", color: "white" }
          : { backgroundColor: "var(--terracotta)", color: "white" }
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
        ? "Getting location..."
        : isClockedIn
        ? "Clock Out"
        : "Clock In"}
    </Button>
  );
}