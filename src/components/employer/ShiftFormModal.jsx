import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MobileSelect from "../mobile/MobileSelect";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Coffee, ChefHat, Wine, UtensilsCrossed, Users } from "lucide-react";
import { toast } from "sonner";

const skillsByRole = {
  barista: ["espresso", "latte_art", "filter", "pour_over", "cold_brew", "customer_service", "opening", "closing", "cash_handling"],
  bartender: ["cocktails", "wine", "beer", "spirits", "customer_service", "cash_handling", "speed", "upselling"],
  mixologist: ["cocktails", "spirits", "garnishes", "menu_creation", "fermentation", "wine_pairing", "customer_service"],
  waiter: ["table_service", "customer_service", "pos_system", "wine_service", "upselling", "allergen_awareness", "cash_handling"],
  chef: ["line_cook", "prep_cook", "grill", "saute", "pastry", "sous_chef", "head_chef", "food_safety", "inventory", "menu_planning", "plating", "butchery", "seafood", "vegetarian"]
};

export default function ShiftFormModal({ venue, venueType = 'coffee_shop', onClose }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    role_type: venueType === 'restaurant' ? 'chef' : 'barista',
    chef_level: '',
    date: '',
    start_time: '',
    end_time: '',
    hourly_rate: '',
    description: '',
    skills_required: []
  });

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const skillOptions = skillsByRole[formData.role_type] || skillsByRole.barista;

  const createShiftMutation = useMutation({
    mutationFn: (data) => {
      const isPremium = user?.employer_premium === true;
      return base44.entities.Shift.create({
        venue_type: venueType,
        venue_id: venue.id,
        venue_name: venue.name,
        location: venue.location,
        status: 'available',
        applications_count: 0,
        is_premium_featured: isPremium,
        ...data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerShifts'] });
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift posted successfully');
      onClose();
    },
  });

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.includes(skill)
        ? prev.skills_required.filter(s => s !== skill)
        : [...prev.skills_required, skill]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.start_time || !formData.end_time || !formData.hourly_rate) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.end_time <= formData.start_time) {
      toast.error('End time must be after start time');
      return;
    }
    if (parseFloat(formData.hourly_rate) <= 0) {
      toast.error('Hourly rate must be greater than 0');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (formData.date < today) {
      toast.error('Shift date cannot be in the past');
      return;
    }
    createShiftMutation.mutate({
      ...formData,
      hourly_rate: parseFloat(formData.hourly_rate)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-2xl w-full rounded-2xl p-8 my-8" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {formData.role_type === 'chef' ? (
              <ChefHat className="w-8 h-8" style={{ color: 'var(--sage)' }} />
            ) : (
              <Coffee className="w-8 h-8" style={{ color: 'var(--terracotta)' }} />
            )}
            <h2 className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Post New Shift
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" style={{ color: 'var(--clay)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Type Selector */}
          <div>
            <Label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>ROLE TYPE *</Label>
            <MobileSelect 
              value={formData.role_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, role_type: value, chef_level: '', skills_required: [] }))}
            >
              <SelectTrigger className="rounded-xl border" style={{ borderColor: 'var(--sand)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="barista">
                  <div className="flex items-center gap-2"><Coffee className="w-4 h-4" />Barista</div>
                </SelectItem>
                <SelectItem value="bartender">
                  <div className="flex items-center gap-2"><Wine className="w-4 h-4" />Bartender</div>
                </SelectItem>
                <SelectItem value="mixologist">
                  <div className="flex items-center gap-2"><Wine className="w-4 h-4" />Mixologist</div>
                </SelectItem>
                <SelectItem value="waiter">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" />Waiter / Server</div>
                </SelectItem>
                <SelectItem value="chef">
                  <div className="flex items-center gap-2"><ChefHat className="w-4 h-4" />Chef / Kitchen</div>
                </SelectItem>
              </SelectContent>
            </MobileSelect>
          </div>

          {/* Chef Level Selector (only for chef roles) */}
          {formData.role_type === 'chef' && (
            <div>
              <Label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>CHEF LEVEL *</Label>
              <MobileSelect 
                value={formData.chef_level} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, chef_level: value }))}
              >
                <SelectTrigger className="rounded-xl border" style={{ borderColor: 'var(--sand)' }}>
                  <SelectValue placeholder="Select chef level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commis_chef">Commis Chef</SelectItem>
                  <SelectItem value="chef_de_partie">Chef de Partie</SelectItem>
                  <SelectItem value="sous_chef">Sous Chef</SelectItem>
                  <SelectItem value="head_chef">Head Chef</SelectItem>
                </SelectContent>
              </MobileSelect>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>DATE *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="rounded-xl border"
                style={{ borderColor: 'var(--sand)' }}
                required
              />
            </div>
            
            <div>
              <Label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>HOURLY RATE (€) *</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.hourly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                className="rounded-xl border"
                style={{ borderColor: 'var(--sand)' }}
                placeholder={formData.role_type === 'chef' ? '16.00' : '13.50'}
                required
              />
            </div>

            <div>
              <Label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>START TIME *</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="rounded-xl border"
                style={{ borderColor: 'var(--sand)' }}
                required
              />
            </div>

            <div>
              <Label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>END TIME *</Label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                className="rounded-xl border"
                style={{ borderColor: 'var(--sand)' }}
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>DESCRIPTION</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="rounded-xl border"
              style={{ borderColor: 'var(--sand)' }}
              placeholder="Describe the shift requirements..."
              rows={3}
            />
          </div>

          <div>
            <Label className="text-xs tracking-wider mb-3 block" style={{ color: 'var(--clay)' }}>
              REQUIRED SKILLS ({formData.role_type === 'chef' ? 'Kitchen' : 'Barista'})
            </Label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="px-4 py-2 rounded-xl transition-all font-normal"
                  style={formData.skills_required.includes(skill) ? {
                    backgroundColor: formData.role_type === 'chef' ? 'var(--sage)' : 'var(--terracotta)',
                    color: 'white',
                    border: 'none'
                  } : {
                    backgroundColor: 'transparent',
                    border: '1px solid var(--sand)',
                    color: 'var(--clay)'
                  }}
                >
                  {skill.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={createShiftMutation.isPending}
              className="flex-1 rounded-xl font-normal"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
            >
              {createShiftMutation.isPending ? 'Posting...' : 'Post Shift'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl font-normal"
              style={{ borderColor: 'var(--sand)', color: 'var(--clay)' }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}