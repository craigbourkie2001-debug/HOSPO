import React from 'react';
import { MapPin, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { formatDistance } from "./geoUtils";

const roleLabels = {
  barista: 'Barista',
  chef: 'Chef',
  bartender: 'Bartender',
  mixologist: 'Mixologist',
  waiter: 'Waiter / Server',
};

export default function ShiftCard({ shift, onApply, isLoading, featured = false, distance = null }) {
  const roleLabel = shift.role_type === 'chef' && shift.chef_level
    ? shift.chef_level.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : roleLabels[shift.role_type] || shift.role_type;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{
        boxShadow: featured
          ? '0 0 0 2px #C89F8C, 0 4px 20px rgba(200,159,140,0.15)'
          : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      <div className="p-5">

        {/* Venue name + rate */}
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-[17px] font-semibold leading-snug flex-1 pr-3" style={{ color: '#1C1C1E' }}>
            {shift.venue_name || shift.coffee_shop_name}
          </h3>
          <div className="flex-shrink-0 text-right">
            <span className="text-[22px] font-bold" style={{ color: '#1C1C1E' }}>€{shift.hourly_rate}</span>
            <span className="text-[13px] ml-0.5" style={{ color: '#8E8E93' }}>/hr</span>
          </div>
        </div>

        {/* Location · role · distance */}
        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 mb-4">
          <span className="text-[13px]" style={{ color: '#8E8E93' }}>{shift.location}</span>
          <span style={{ color: '#D1D1D6' }}>·</span>
          <span
            className="text-[12px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#F2F2F7', color: '#6E6E73' }}
          >
            {roleLabel}
          </span>
          {featured && (
            <span
              className="text-[12px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#C89F8C', color: 'white' }}
            >
              Featured
            </span>
          )}
          {distance !== null && (
            <>
              <span style={{ color: '#D1D1D6' }}>·</span>
              <span className="flex items-center gap-1 text-[13px]" style={{ color: '#8E8E93' }}>
                <MapPin className="w-3 h-3" />
                {formatDistance(distance)}
              </span>
            </>
          )}
        </div>

        {/* Date & time chips */}
        <div className="flex gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ backgroundColor: '#F2F2F7' }}>
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#8E8E93' }} />
            <span className="text-[13px] font-medium" style={{ color: '#3A3A3C' }}>
              {format(new Date(shift.date), 'EEE, d MMM')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ backgroundColor: '#F2F2F7' }}>
            <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#8E8E93' }} />
            <span className="text-[13px] font-medium" style={{ color: '#3A3A3C' }}>
              {shift.start_time} – {shift.end_time}
            </span>
          </div>
        </div>

        {/* Description */}
        {shift.description && (
          <p className="text-[14px] mb-4 line-clamp-2 leading-relaxed" style={{ color: '#6E6E73' }}>
            {shift.description}
          </p>
        )}

        {/* Skills */}
        {shift.skills_required && shift.skills_required.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {shift.skills_required.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="text-[12px] px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#F2F2F7', color: '#6E6E73' }}
              >
                {skill.replace(/_/g, ' ')}
              </span>
            ))}
            {shift.skills_required.length > 4 && (
              <span
                className="text-[12px] px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#F2F2F7', color: '#8E8E93' }}
              >
                +{shift.skills_required.length - 4}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onApply}
          disabled={isLoading}
          className="w-full py-3 rounded-xl text-[15px] font-semibold transition-opacity disabled:opacity-50 active:opacity-80"
          style={{ backgroundColor: '#C89F8C', color: 'white' }}
        >
          {isLoading ? 'Applying…' : 'Apply for Shift'}
        </button>

      </div>
    </div>
  );
}