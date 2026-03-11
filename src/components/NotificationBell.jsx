import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Bell, Check, X, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

const DISMISSED_KEY = "hospo_dismissed_notifications";

function getDismissed() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveDismissed(set) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
}

// Generate a stable ID for a notification
function notifId(n) {
  return `${n.type}::${n.sourceId}`;
}

export default function NotificationBell() {
  const [user, setUser] = useState(null);
  const [dismissed, setDismissed] = useState(getDismissed);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: rawNotifications = [], refetch } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];

      const [myApplications, myShifts, reviews] = await Promise.all([
        base44.entities.ShiftApplication.filter({ applicant_email: user.email }, '-created_date', 20),
        base44.entities.Shift.filter({ assigned_to: user.email }, '-updated_date', 20),
        base44.entities.WorkerReview.filter({ worker_email: user.email }, '-created_date', 10),
      ]);

      const notifs = [
        ...myApplications
          .filter(app => app.status === 'accepted' || app.status === 'rejected')
          .map(app => ({
            type: app.status === 'accepted' ? 'application_accepted' : 'application_rejected',
            sourceId: app.id,
            message: app.status === 'accepted'
              ? `🎉 Application accepted at ${app.venue_name}!`
              : `Application for ${app.venue_name} was not selected`,
            date: app.created_date,
          })),
        ...myShifts
          .filter(s => s.status === 'filled')
          .map(shift => ({
            type: 'shift_assigned',
            sourceId: shift.id,
            message: `✅ Shift confirmed at ${shift.venue_name} on ${format(new Date(shift.date), 'MMM d')}`,
            date: shift.assigned_at || shift.created_date,
          })),
        ...myShifts
          .filter(s => s.status === 'completed')
          .map(shift => ({
            type: 'shift_completed',
            sourceId: shift.id,
            message: `🏁 Shift at ${shift.venue_name} on ${format(new Date(shift.date), 'MMM d')} marked as completed`,
            date: shift.updated_date || shift.created_date,
          })),
        ...reviews.map(review => ({
          type: 'review_received',
          sourceId: review.id,
          message: `⭐ New review from ${review.coffee_shop_name}: ${review.rating}/5 stars`,
          date: review.created_date,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);

      return notifs;
    },
    initialData: [],
    enabled: !!user?.email,
    refetchInterval: 60000,
  });

  const visible = rawNotifications.filter(n => !dismissed.has(notifId(n)));
  const unreadCount = visible.length;

  const dismiss = useCallback((n) => {
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(notifId(n));
      saveDismissed(next);
      return next;
    });
  }, []);

  const dismissAll = useCallback(() => {
    setDismissed(prev => {
      const next = new Set(prev);
      rawNotifications.forEach(n => next.add(notifId(n)));
      saveDismissed(next);
      return next;
    });
  }, [rawNotifications]);

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-all">
          <Bell className="w-5 h-5" style={{ color: 'var(--clay)' }} />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-xl shadow-xl" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--sand)' }}>
          <h3 className="font-normal text-lg" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Notifications
          </h3>
          {visible.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={dismissAll}
              className="text-xs h-7 px-2 rounded-lg"
              style={{ color: 'var(--clay)' }}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Clear all
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {visible.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" style={{ color: 'var(--clay)' }} />
              <p className="text-sm font-light" style={{ color: 'var(--clay)' }}>
                All caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--sand)' }}>
              {visible.map((notification) => (
                <div
                  key={notifId(notification)}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-normal mb-1 leading-snug" style={{ color: 'var(--earth)' }}>
                      {notification.message}
                    </p>
                    <p className="text-xs font-light" style={{ color: 'var(--clay)' }}>
                      {format(new Date(notification.date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <button
                    onClick={() => dismiss(notification)}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    style={{ backgroundColor: 'var(--sage)', color: 'white' }}
                    title="Mark as done"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}