import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const skillOptions = [
  "espresso", "latte_art", "filter", "customer_service", "opening", "closing", "cash_handling"
];

export default function ShiftFilters({ filters, setFilters, availableLocations, shifts }) {
  const availableDates = [...new Set(shifts.map(s => s.date).filter(Boolean))].sort();

  const toggleSkill = (skill) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="mb-8 p-6 rounded-2xl shadow-sm" style={{ backgroundColor: 'white' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--espresso)' }}>
        Filters
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--coffee-brown)' }}>
            Location
          </label>
          <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
            <SelectTrigger className="rounded-xl" style={{ borderColor: 'var(--latte)' }}>
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {availableLocations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--coffee-brown)' }}>
            Date
          </label>
          <Select value={filters.date} onValueChange={(value) => setFilters(prev => ({ ...prev, date: value }))}>
            <SelectTrigger className="rounded-xl" style={{ borderColor: 'var(--latte)' }}>
              <SelectValue placeholder="All dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              {availableDates.map(date => (
                <SelectItem key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--coffee-brown)' }}>
          Skills
        </label>
        <div className="flex flex-wrap gap-2">
          {skillOptions.map(skill => (
            <Badge
              key={skill}
              variant={filters.skills.includes(skill) ? "default" : "outline"}
              className="cursor-pointer transition-all duration-200 hover:shadow-md rounded-lg px-3 py-1.5"
              style={filters.skills.includes(skill) ? { 
                backgroundColor: 'var(--fresh-green)',
                color: 'white'
              } : {
                borderColor: 'var(--latte)',
                color: 'var(--coffee-brown)'
              }}
              onClick={() => toggleSkill(skill)}
            >
              {skill.replace(/_/g, ' ')}
              {filters.skills.includes(skill) && <X className="w-3 h-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      {(filters.location !== "all" || filters.date !== "all" || filters.skills.length > 0) && (
        <Button
          variant="ghost"
          onClick={() => setFilters({ location: "all", date: "all", skills: [] })}
          className="mt-4 rounded-xl"
          style={{ color: 'var(--coffee-brown)' }}
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}