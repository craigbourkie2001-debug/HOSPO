import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, DollarSign, MapPin, Trash2, User } from "lucide-react";
import { format } from "date-fns";

export default function EmployerShiftCard({ shift, onDelete }) {
  const getStatusColor = () => {
    switch (shift.status) {
      case 'available': return { bg: 'var(--sage)', text: 'white' };
      case 'claimed': return { bg: 'var(--terracotta)', text: 'white' };
      case 'completed': return { bg: 'var(--clay)', text: 'white' };
      default: return { bg: 'var(--sand)', text: 'var(--earth)' };
    }
  };

  const statusColors = getStatusColor();

  return (
    <Card className="border rounded-xl hover-lift transition-all" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--cream)' }}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <Badge className="rounded-lg font-normal" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
            {shift.status}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--clay)' }} />
            <span className="font-normal" style={{ color: 'var(--earth)' }}>
              {format(new Date(shift.date), 'EEEE, MMM d, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: 'var(--clay)' }} />
            <span className="font-light" style={{ color: 'var(--earth)' }}>
              {shift.start_time} - {shift.end_time}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" style={{ color: 'var(--clay)' }} />
            <span className="font-normal text-lg" style={{ color: 'var(--terracotta)' }}>
              €{shift.hourly_rate}/hr
            </span>
          </div>

          {shift.claimed_by && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--sand)' }}>
              <User className="w-4 h-4" style={{ color: 'var(--clay)' }} />
              <div>
                <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>CLAIMED BY</div>
                <div className="font-normal" style={{ color: 'var(--earth)' }}>{shift.claimed_by}</div>
              </div>
            </div>
          )}

          {shift.description && (
            <p className="text-sm font-light mt-2" style={{ color: 'var(--clay)' }}>
              {shift.description}
            </p>
          )}

          {shift.skills_required && shift.skills_required.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {shift.skills_required.map((skill, idx) => (
                <Badge key={idx} variant="outline" className="text-xs font-light" style={{ borderColor: 'var(--sand)', color: 'var(--clay)' }}>
                  {skill.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}