import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import MobileSelect from "../mobile/MobileSelect";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function JobFormModal({ job, venueId, venueType, onClose }) {
  const [formData, setFormData] = useState({
    job_title: '',
    role_type: 'barista',
    employment_type: 'full_time',
    salary_min: 25000,
    salary_max: 35000,
    hourly_rate: 14,
    hours_per_week: 40,
    location: '',
    description: '',
    responsibilities: [],
    requirements: [],
    benefits: [],
    skills_required: [],
    experience_years: 0,
    start_date: ''
  });

  const [currentResponsibility, setCurrentResponsibility] = useState('');
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [currentBenefit, setCurrentBenefit] = useState('');
  const [currentSkill, setCurrentSkill] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    if (job) {
      setFormData({ ...job });
    }
  }, [job]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (job) {
        return base44.entities.Job.update(job.id, data);
      } else {
        return base44.entities.Job.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employer-jobs']);
      toast.success(job ? 'Job updated' : 'Job posted');
      onClose();
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const user = await base44.auth.me();
    const venue = venueType === 'restaurant' 
      ? (await base44.entities.Restaurant.filter({ id: venueId }))[0]
      : (await base44.entities.CoffeeShop.filter({ id: venueId }))[0];

    saveMutation.mutate({
      ...formData,
      venue_type: venueType,
      venue_id: venueId,
      venue_name: venue.name
    });
  };

  const addItem = (field, value, setter) => {
    if (value.trim()) {
      setFormData({ ...formData, [field]: [...(formData[field] || []), value.trim()] });
      setter('');
    }
  };

  const removeItem = (field, index) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--warm-white)' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            {job ? 'Edit Job Posting' : 'Post New Job'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Job Title</Label>
              <Input
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="e.g., Head Chef, Senior Barista"
                className="rounded-xl"
                required
              />
            </div>

            <div>
              <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Role Type</Label>
              <MobileSelect value={formData.role_type} onValueChange={(val) => setFormData({ ...formData, role_type: val })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barista">Barista</SelectItem>
                  <SelectItem value="chef">Chef</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                  <SelectItem value="bartender">Bartender</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="kitchen_porter">Kitchen Porter</SelectItem>
                </SelectContent>
              </MobileSelect>
            </div>

            <div>
              <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Employment Type</Label>
              <MobileSelect value={formData.employment_type} onValueChange={(val) => setFormData({ ...formData, employment_type: val })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                </SelectContent>
              </MobileSelect>
            </div>

            <div>
              <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Dublin, Cork"
                className="rounded-xl"
                required
              />
            </div>
          </div>

          {formData.employment_type === 'full_time' ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Salary Min (€/year)</Label>
                <Input
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({ ...formData, salary_min: parseFloat(e.target.value) })}
                  className="rounded-xl"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Salary Max (€/year)</Label>
                <Input
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({ ...formData, salary_max: parseFloat(e.target.value) })}
                  className="rounded-xl"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Hourly Rate (€)</Label>
                <Input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                  className="rounded-xl"
                  min="0"
                  step="0.5"
                />
              </div>
              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Hours per Week</Label>
                <Input
                  type="number"
                  value={formData.hours_per_week}
                  onChange={(e) => setFormData({ ...formData, hours_per_week: parseFloat(e.target.value) })}
                  className="rounded-xl"
                  min="0"
                />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Experience Required (years)</Label>
              <Input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseFloat(e.target.value) })}
                className="rounded-xl"
                min="0"
              />
            </div>
            <div>
              <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Job Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role and what you're looking for..."
              className="rounded-xl min-h-24"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Key Responsibilities</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentResponsibility}
                onChange={(e) => setCurrentResponsibility(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('responsibilities', currentResponsibility, setCurrentResponsibility))}
                placeholder="Add a responsibility"
                className="rounded-xl"
              />
              <Button
                type="button"
                onClick={() => addItem('responsibilities', currentResponsibility, setCurrentResponsibility)}
                variant="outline"
                className="rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.responsibilities?.map((item, idx) => (
                <Badge key={idx} variant="outline" className="font-normal" style={{ borderColor: 'var(--sand)' }}>
                  {item}
                  <button type="button" onClick={() => removeItem('responsibilities', idx)} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Requirements</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentRequirement}
                onChange={(e) => setCurrentRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('requirements', currentRequirement, setCurrentRequirement))}
                placeholder="Add a requirement"
                className="rounded-xl"
              />
              <Button
                type="button"
                onClick={() => addItem('requirements', currentRequirement, setCurrentRequirement)}
                variant="outline"
                className="rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requirements?.map((item, idx) => (
                <Badge key={idx} variant="outline" className="font-normal" style={{ borderColor: 'var(--sand)' }}>
                  {item}
                  <button type="button" onClick={() => removeItem('requirements', idx)} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Benefits</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentBenefit}
                onChange={(e) => setCurrentBenefit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('benefits', currentBenefit, setCurrentBenefit))}
                placeholder="Add a benefit"
                className="rounded-xl"
              />
              <Button
                type="button"
                onClick={() => addItem('benefits', currentBenefit, setCurrentBenefit)}
                variant="outline"
                className="rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.benefits?.map((item, idx) => (
                <Badge key={idx} variant="outline" className="font-normal" style={{ borderColor: 'var(--sand)' }}>
                  {item}
                  <button type="button" onClick={() => removeItem('benefits', idx)} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Required Skills</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skills_required', currentSkill, setCurrentSkill))}
                placeholder="Add a skill"
                className="rounded-xl"
              />
              <Button
                type="button"
                onClick={() => addItem('skills_required', currentSkill, setCurrentSkill)}
                variant="outline"
                className="rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills_required?.map((item, idx) => (
                <Badge key={idx} variant="outline" className="font-normal" style={{ borderColor: 'var(--sand)' }}>
                  {item}
                  <button type="button" onClick={() => removeItem('skills_required', idx)} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl font-normal"
              style={{ borderColor: 'var(--sand)' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 rounded-xl font-normal"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
            >
              {saveMutation.isPending ? 'Saving...' : (job ? 'Update Job' : 'Post Job')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}