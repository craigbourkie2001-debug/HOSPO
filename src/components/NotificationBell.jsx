import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

export default function NotificationBell() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      
      // Get shifts claimed by the user
      const myShifts = await base44.entities.Shift.filter({ 
        claimed_by: user.email,
        status: 'claimed'
      });

      // Get worker reviews for the user
      const reviews = await base44.entities.WorkerReview.filter({ 
        worker_email: user.email 
      }, '-created_date', 5);

      const notifications = [
        ...myShifts.map(shift => ({
          type: 'shift_claimed',
          message: `Shift at ${shift.coffee_shop_name} on ${format(new Date(shift.date), 'MMM d')}`,
          date: shift.claimed_at
        })),
        ...reviews.map(review => ({
          type: 'review_received',
          message: `New review from ${review.coffee_shop_name}: ${review.rating} stars`,
          date: review.created_date
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

      return notifications;
    },
    initialData: [],
    enabled: !!user?.email,
    refetchInterval: 60000 // Refetch every minute
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
      <PopoverContent className="w-80 p-0 rounded-xl" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--sand)' }}>
          <h3 className="font-normal text-lg" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Notifications
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" style={{ color: 'var(--clay)' }} />
              <p className="text-sm font-light" style={{ color: 'var(--clay)' }}>
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--sand)' }}>
              {notifications.map((notification, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-normal mb-1" style={{ color: 'var(--earth)' }}>
                    {notification.message}
                  </p>
                  <p className="text-xs font-light" style={{ color: 'var(--clay)' }}>
                    {format(new Date(notification.date), 'MMM d, h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}