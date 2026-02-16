import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Filter, DollarSign } from "lucide-react";

const baristaSkillOptions = [
  "espresso", "latte_art", "filter", "customer_service", "opening", "closing", "cash_handling"
];

const chefSkillOptions = [
  "line_cook", "prep_cook", "grill", "saute", "pastry", "sous_chef", "head_chef", 
  "food_safety", "plating", "butchery", "seafood", "vegetarian"
];

export default function ShiftFilters({ filters, setFilters, availableLocations, shifts, roleFilter }) {
  const availableDates = [...new Set(shifts.map(s => s.date).filter(Boolean))].sort();
  
  // Choose skill options based on role filter
  const skillOptions = roleFilter === 'chef' 
    ? chefSkillOptions 
    : roleFilter === 'barista' 
      ? baristaSkillOptions 
      : [...baristaSkillOptions, ...chefSkillOptions];

  const toggleSkill = (skill) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  // Reset skill filters when role filter changes
  React.useEffect(() => {
    setFilters(prev => ({ ...prev, skills: [] }));
  }, [roleFilter]);

  return (
    <div className="mb-10 p-8 rounded-2xl border" style={{ backgroundColor: 'var(--warm-white)', borderColor: 'var(--sand)' }}>
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
        <h3 className="text-xl font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
          Filters
        </h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <div>
          <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
            LOCATION
          </label>
          <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
            <SelectTrigger className="rounded-xl h-11 border" style={{ borderColor: 'var(--sand)', backgroundColor: 'white' }}>
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
          <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
            DATE
          </label>
          <Select value={filters.date} onValueChange={(value) => setFilters(prev => ({ ...prev, date: value }))}>
            <SelectTrigger className="rounded-xl h-11 border" style={{ borderColor: 'var(--sand)', backgroundColor: 'white' }}>
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

      {/* Pay Rate Range */}
      <div className="mb-6">
        <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
          PAY RATE (€/HOUR)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--clay)' }} />
            <Input
              type="number"
              placeholder="Min"
              value={filters.payRate.min === 0 ? '' : filters.payRate.min}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                payRate: { ...prev.payRate, min: parseFloat(e.target.value) || 0 }
              }))}
              className="pl-10 rounded-xl h-11"
              style={{ borderColor: 'var(--sand)', backgroundColor: 'white' }}
            />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--clay)' }} />
            <Input
              type="number"
              placeholder="Max"
              value={filters.payRate.max === 999 ? '' : filters.payRate.max}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                payRate: { ...prev.payRate, max: parseFloat(e.target.value) || 999 }
              }))}
              className="pl-10 rounded-xl h-11"
              style={{ borderColor: 'var(--sand)', backgroundColor: 'white' }}
            />
          </div>
        </div>
      </div>

      {/* Shift Time */}
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <div>
          <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
            SHIFT TIME
          </label>
          <Select value={filters.shiftTime} onValueChange={(value) => setFilters(prev => ({ ...prev, shiftTime: value }))}>
            <SelectTrigger className="rounded-xl h-11 border" style={{ borderColor: 'var(--sand)', backgroundColor: 'white' }}>
              <SelectValue placeholder="All times" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All times</SelectItem>
              <SelectItem value="morning">Morning (5am - 12pm)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
              <SelectItem value="evening">Evening (5pm+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {roleFilter === 'chef' && (
          <div>
            <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
              CHEF LEVEL
            </label>
            <Select value={filters.chefLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, chefLevel: value }))}>
              <SelectTrigger className="rounded-xl h-11 border" style={{ borderColor: 'var(--sand)', backgroundColor: 'white' }}>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="commis_chef">Commis Chef</SelectItem>
                <SelectItem value="chef_de_partie">Chef de Partie</SelectItem>
                <SelectItem value="sous_chef">Sous Chef</SelectItem>
                <SelectItem value="head_chef">Head Chef</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs tracking-wider mb-3 block font-normal" style={{ color: 'var(--clay)' }}>
          SKILLS
        </label>
        <div className="flex flex-wrap gap-2">
          {skillOptions.map(skill => {
            const isSelected = filters.skills.includes(skill);
            const isChefSkill = chefSkillOptions.includes(skill);
            return (
              <Badge
                key={skill}
                className="cursor-pointer transition-all duration-200 hover-lift rounded-xl px-4 py-2 text-xs font-normal tracking-wide"
                style={isSelected ? {
                  backgroundColor: isChefSkill ? 'var(--sage)' : 'var(--terracotta)',
                  color: 'white',
                  border: 'none'
                } : {
                  backgroundColor: 'transparent',
                  border: '1px solid var(--sand)',
                  color: 'var(--clay)'
                }}
                onClick={() => toggleSkill(skill)}
              >
                {skill.replace(/_/g, ' ')}
                {isSelected && <X className="w-3 h-3 ml-1" />}
              </Badge>
            );
          })}
        </div>
      </div>

      {(filters.location !== "all" || filters.date !== "all" || filters.skills.length > 0 || 
        filters.payRate.min > 0 || filters.payRate.max < 999 || filters.shiftTime !== "all" || 
        filters.chefLevel !== "all") && (
        <Button
          variant="ghost"
          onClick={() => setFilters({ 
            location: "all", 
            date: "all", 
            skills: [], 
            payRate: { min: 0, max: 999 },
            shiftTime: "all",
            chefLevel: "all"
          })}
          className="mt-6 rounded-xl font-normal"
          style={{ color: 'var(--clay)' }}
        >
          <X className="w-4 h-4 mr-2" />
          Clear all filters
        </Button>
      )}
    </div>
  );
}