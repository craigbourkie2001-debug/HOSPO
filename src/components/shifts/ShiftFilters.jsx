import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

const skillOptions = [
  "espresso", "latte_art", "filter", "customer_service", "opening", "closing", "cash_handling"
];

const skillGradients = {
  espresso: 'from-amber-400 to-orange-500',
  latte_art: 'from-pink-400 to-rose-500',
  filter: 'from-blue-400 to-cyan-500',
  customer_service: 'from-green-400 to-emerald-500',
  opening: 'from-purple-400 to-indigo-500',
  closing: 'from-indigo-400 to-blue-500',
  cash_handling: 'from-emerald-400 to-teal-500'
};

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
    <div className="mb-8 p-8 rounded-3xl shadow-xl bg-white">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Filter className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          Filters
        </h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-semibold mb-2 block text-gray-700">
            📍 Location
          </label>
          <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
            <SelectTrigger className="rounded-2xl h-12 border-2 border-purple-200 focus:border-purple-500">
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
          <label className="text-sm font-semibold mb-2 block text-gray-700">
            📅 Date
          </label>
          <Select value={filters.date} onValueChange={(value) => setFilters(prev => ({ ...prev, date: value }))}>
            <SelectTrigger className="rounded-2xl h-12 border-2 border-purple-200 focus:border-purple-500">
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
        <label className="text-sm font-semibold mb-3 block text-gray-700">
          ✨ Skills
        </label>
        <div className="flex flex-wrap gap-2">
          {skillOptions.map(skill => {
            const isSelected = filters.skills.includes(skill);
            return (
              <Badge
                key={skill}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl rounded-2xl px-4 py-2 text-sm font-semibold border-0 ${
                  isSelected 
                    ? `bg-gradient-to-r ${skillGradients[skill]} text-white shadow-lg` 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => toggleSkill(skill)}
              >
                {skill.replace(/_/g, ' ')}
                {isSelected && <X className="w-3 h-3 ml-1" />}
              </Badge>
            );
          })}
        </div>
      </div>

      {(filters.location !== "all" || filters.date !== "all" || filters.skills.length > 0) && (
        <Button
          variant="ghost"
          onClick={() => setFilters({ location: "all", date: "all", skills: [] })}
          className="mt-6 rounded-2xl text-purple-600 hover:bg-purple-50 font-semibold"
        >
          <X className="w-4 h-4 mr-2" />
          Clear all filters
        </Button>
      )}
    </div>
  );
}