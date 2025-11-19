import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";

const skillOptions = [
  "espresso", "latte_art", "filter", "pour_over", "cold_brew", 
  "customer_service", "opening", "closing", "cash_handling"
];

export default function ShiftFormModal({ coffeeShop, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    hourly_rate: '',
    description: '',
    skills_required: []
  });

  const createShiftMutation = useMutation({
    mutationFn: (data) => base44.entities.Shift.create({
      coffee_shop_id: coffeeShop.id,
      coffee_shop_name: coffeeShop.name,
      location: coffeeShop.location,
      status: 'available',
      ...data
    }),
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
    createShiftMutation.mutate({
      ...formData,
      hourly_rate: parseFloat(formData.hourly_rate)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full rounded-2xl p-8" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Post New Shift
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" style={{ color: 'var(--clay)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="13.50"
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
            <Label className="text-xs tracking-wider mb-3 block" style={{ color: 'var(--clay)' }}>REQUIRED SKILLS</Label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="px-4 py-2 rounded-xl transition-all font-normal"
                  style={formData.skills_required.includes(skill) ? {
                    backgroundColor: 'var(--terracotta)',
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