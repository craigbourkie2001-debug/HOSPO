import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getDistanceKm, getLocationCoords } from "./geoUtils";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const CLOCK_IN_RADIUS_KM = 0.5; // 500 metres

export default function ClockInButton({ shift }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const isClockedIn = !!shift.clock_in_time;
  const isClockedOut = !!shift.clock_out_time;

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
      // Can't geocode venue — allow with warning
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

  const createPaymentOnClockOut = async (clockOutTime) => {
    try {
      const clockIn = new Date(shift.clock_in_time);
      const clockOut = new Date(clockOutTime);
      const hoursWorked = Math.round(((clockOut - clockIn) / 3600000) * 100) / 100;
      const grossAmount = Math.round(hoursWorked * shift.hourly_rate * 100) / 100;
      const platformFeeEmployer = Math.round(grossAmount * 0.10 * 100) / 100;
      const platformFeeWorker = Math.round(grossAmount * 0.10 * 100) / 100;
      const workerPayout = Math.round((grossAmount - platformFeeWorker) * 100) / 100;
      const employerTotal = Math.round((grossAmount + platformFeeEmployer) * 100) / 100;

      // Fetch venue to get employer contact email
      const venueArr = shift.venue_type === 'restaurant'
        ? await base44.entities.Restaurant.filter({ id: shift.venue_id })
        : await base44.entities.CoffeeShop.filter({ id: shift.venue_id });
      const employerEmail = venueArr?.[0]?.contact_email || '';

      await base44.entities.Payment.create({
        shift_id: shift.id,
        worker_email: shift.assigned_to,
        worker_name: shift.assigned_to_name,
        employer_email: employerEmail,
        venue_name: shift.venue_name,
        shift_date: shift.date,
        hours_worked: hoursWorked,
        hourly_rate: shift.hourly_rate,
        gross_amount: grossAmount,
        platform_fee_employer: platformFeeEmployer,
        platform_fee_worker: platformFeeWorker,
        worker_payout: workerPayout,
        employer_total: employerTotal,
        status: 'pending',
      });
    } catch (err) {
      console.warn('Payment record creation failed (non-critical):', err.message);
    }
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
        await base44.entities.Shift.update(shift.id, { clock_in_time: now });
        toast.success(`Clocked in at ${format(new Date(now), "HH:mm")} ✓`);
      } else {
        // Clock out: update shift to completed + create payment record
        await base44.entities.Shift.update(shift.id, {
          clock_out_time: now,
          status: 'completed',
        });
        await createPaymentOnClockOut(now);
        toast.success(`Clocked out at ${format(new Date(now), "HH:mm")}. Great shift!`);
      }

      queryClient.invalidateQueries({ queryKey: ["myShifts"] });
      queryClient.invalidateQueries({ queryKey: ["employerShifts"] });
    } catch (err) {
      if (err.code === 1) {
        toast.error("Location permission denied. Please allow location access.");
      } else if (err.code === 2) {
        toast.error("Unable to determine your location. Please try again.");
      } else if (err.code === 3) {
        toast.error("Location request timed out. Please try again.");
      } else {
        toast.error("Failed to clock in/out. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isClockedOut) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ backgroundColor: "#8A9B8E15", color: "var(--sage)" }}>
        <CheckCircle className="w-4 h-4" />
        <span>
          Clocked in {format(new Date(shift.clock_in_time), "HH:mm")} – out {format(new Date(shift.clock_out_time), "HH:mm")}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {isClockedIn && (
        <div className="flex items-center gap-2 text-xs px-1" style={{ color: "var(--sage)" }}>
          <LogIn className="w-3 h-3" />
          Clocked in at {format(new Date(shift.clock_in_time), "HH:mm")}
        </div>
      )}
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
        {loading ? "Getting location..." : isClockedIn ? "Clock Out" : "Clock In"}
      </Button>
    </div>
  );
}