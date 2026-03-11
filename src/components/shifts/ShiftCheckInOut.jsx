import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const GPS_RADIUS_METERS = 500; // Allow check-in within 500m of venue

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

export default function ShiftCheckInOut({ shift, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const isCheckedIn = !!shift.checkin_time;
  const isCheckedOut = !!shift.checkout_time;
  const hasVenueCoords = shift.venue_latitude && shift.venue_longitude;

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const pos = await getPosition();
      const { latitude, longitude } = pos.coords;

      if (hasVenueCoords) {
        const dist = haversineDistance(latitude, longitude, shift.venue_latitude, shift.venue_longitude);
        if (dist > GPS_RADIUS_METERS) {
          toast.error(`You appear to be ${Math.round(dist)}m from the venue. Must be within ${GPS_RADIUS_METERS}m to check in.`);
          setLoading(false);
          return;
        }
      }

      await base44.entities.Shift.update(shift.id, {
        checkin_time: new Date().toISOString(),
        checkin_latitude: latitude,
        checkin_longitude: longitude,
      });

      toast.success("Checked in! Your shift has started.");
      queryClient.invalidateQueries({ queryKey: ["myShifts"] });
      if (onUpdated) onUpdated();
    } catch (err) {
      if (err.code === 1) {
        toast.error("Location access denied. Please enable GPS to check in.");
      } else {
        toast.error(err.message || "Failed to get your location.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const pos = await getPosition();
      const { latitude, longitude } = pos.coords;

      if (hasVenueCoords) {
        const dist = haversineDistance(latitude, longitude, shift.venue_latitude, shift.venue_longitude);
        if (dist > GPS_RADIUS_METERS) {
          toast.error(`You appear to be ${Math.round(dist)}m from the venue. Must be within ${GPS_RADIUS_METERS}m to check out.`);
          setLoading(false);
          return;
        }
      }

      const checkoutTime = new Date();
      const checkinTime = new Date(shift.checkin_time);
      const actualHours = Math.round(((checkoutTime - checkinTime) / 3600000) * 100) / 100;

      await base44.entities.Shift.update(shift.id, {
        checkout_time: checkoutTime.toISOString(),
        checkout_latitude: latitude,
        checkout_longitude: longitude,
        actual_hours_worked: actualHours,
      });

      toast.success(`Shift complete! You worked ${actualHours} hours.`);
      queryClient.invalidateQueries({ queryKey: ["myShifts"] });
      if (onUpdated) onUpdated();
    } catch (err) {
      if (err.code === 1) {
        toast.error("Location access denied. Please enable GPS to check out.");
      } else {
        toast.error(err.message || "Failed to get your location.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (shift.status !== "filled") return null;

  return (
    <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: "var(--cream)" }}>
      {/* Timesheet summary */}
      {(isCheckedIn || isCheckedOut) && (
        <div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: "var(--cream)" }}>
          {isCheckedIn && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5" style={{ color: "var(--clay)" }}>
                <Navigation className="w-3.5 h-3.5" style={{ color: "var(--sage)" }} />
                Checked in
              </span>
              <span className="font-medium" style={{ color: "var(--earth)" }}>
                {format(new Date(shift.checkin_time), "HH:mm")}
              </span>
            </div>
          )}
          {isCheckedOut && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5" style={{ color: "var(--clay)" }}>
                <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--terracotta)" }} />
                Checked out
              </span>
              <span className="font-medium" style={{ color: "var(--earth)" }}>
                {format(new Date(shift.checkout_time), "HH:mm")}
              </span>
            </div>
          )}
          {isCheckedOut && shift.actual_hours_worked != null && (
            <div className="flex items-center justify-between text-sm pt-2 border-t" style={{ borderColor: "var(--sand)" }}>
              <span className="flex items-center gap-1.5" style={{ color: "var(--clay)" }}>
                <Clock className="w-3.5 h-3.5" />
                Actual hours
              </span>
              <span className="font-semibold" style={{ color: "var(--terracotta)" }}>
                {shift.actual_hours_worked}h
              </span>
            </div>
          )}
        </div>
      )}

      {/* GPS notice if no venue coords */}
      {!hasVenueCoords && !isCheckedIn && (
        <div className="flex items-start gap-2 text-xs p-2 rounded-lg" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>No venue location set — check-in will record your GPS position without proximity verification.</span>
        </div>
      )}

      {/* Action buttons */}
      {!isCheckedIn && !isCheckedOut && (
        <Button
          onClick={handleCheckIn}
          disabled={loading}
          className="w-full rounded-xl h-11 font-medium text-sm"
          style={{ backgroundColor: "var(--sage)", color: "white" }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Navigation className="w-4 h-4 mr-2" />
          )}
          {loading ? "Getting location…" : "Start Shift"}
        </Button>
      )}

      {isCheckedIn && !isCheckedOut && (
        <Button
          onClick={handleCheckOut}
          disabled={loading}
          className="w-full rounded-xl h-11 font-medium text-sm"
          style={{ backgroundColor: "var(--terracotta)", color: "white" }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <MapPin className="w-4 h-4 mr-2" />
          )}
          {loading ? "Getting location…" : "End Shift"}
        </Button>
      )}

      {isCheckedOut && (
        <div className="flex items-center justify-center gap-2 text-sm font-medium" style={{ color: "var(--sage)" }}>
          <CheckCircle className="w-4 h-4" />
          Timesheet recorded
        </div>
      )}
    </div>
  );
}