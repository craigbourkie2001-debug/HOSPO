import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const STEPS = [
  { id: 1, title: "Basic Info", label: "Job Details" },
  { id: 2, title: "Requirements", label: "Skills & Experience" },
  { id: 3, title: "Shift Details", label: "Timing" },
  { id: 4, title: "Location & Pay", label: "Details" },
  { id: 5, title: "Review", label: "Final Check" }
];

export default function JobPostingWizard({ onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    job_title: "",
    role_type: "",
    employment_type: "full_time",
    description: "",
    responsibilities: [],
    requirements: [],
    skills_required: [],
    experience_years: 0,
    location: "",
    hourly_rate: "",
    salary_min: "",
    salary_max: "",
    hours_per_week: "",
    start_date: "",
    benefits: [],
  });
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: venues } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const coffeeShops = await base44.entities.CoffeeShop.filter({ created_by: user?.email }) || [];
      const restaurants = await base44.entities.Restaurant.filter({ created_by: user?.email }) || [];
      return [...coffeeShops, ...restaurants];
    },
    enabled: !!user,
  });

  const [selectedVenue, setSelectedVenue] = useState("");

  const createJobMutation = useMutation({
    mutationFn: async (data) => {
      const venue = venues.find(v => v.id === selectedVenue);
      if (!venue) throw new Error("Venue not selected");

      return base44.entities.Job.create({
        ...data,
        venue_id: venue.id,
        venue_name: venue.name,
        venue_type: venue.__typename || (venue.specialty_focus ? 'coffee_shop' : 'restaurant'),
        status: 'open',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      onSuccess?.();
      onClose();
    },
  });

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.job_title.trim()) newErrors.job_title = "Job title is required";
      if (!formData.role_type) newErrors.role_type = "Role type is required";
      if (!formData.description.trim()) newErrors.description = "Description is required";
    } else if (step === 2) {
      if (formData.experience_years === null) newErrors.experience_years = "Experience is required";
    } else if (step === 3) {
      if (!formData.start_date) newErrors.start_date = "Start date is required";
      if (formData.employment_type === 'part_time' && !formData.hours_per_week) {
        newErrors.hours_per_week = "Hours per week is required for part-time";
      }
    } else if (step === 4) {
      if (!formData.location.trim()) newErrors.location = "Location is required";
      if (formData.employment_type === 'part_time' && !formData.hourly_rate) {
        newErrors.hourly_rate = "Hourly rate is required for part-time";
      }
      if (formData.employment_type === 'full_time' && (!formData.salary_min || !formData.salary_max)) {
        newErrors.salary = "Salary range is required for full-time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateStep(5)) {
      createJobMutation.mutate(formData);
    }
  };

  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addArrayField = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--warm-white)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Post a New Job
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--clay)' }}>
              Step {currentStep} of {STEPS.length}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6" style={{ color: 'var(--clay)' }} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            {STEPS.map((step) => (
              <div key={step.id} className="flex-1 h-1 rounded-full transition-all" style={{
                backgroundColor: step.id <= currentStep ? 'var(--terracotta)' : 'var(--sand)'
              }} />
            ))}
          </div>
          <div className="mt-4 text-center text-sm font-light" style={{ color: 'var(--earth)' }}>
            {STEPS[currentStep - 1].label}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-8"
        >
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Venue</label>
                <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues?.map(venue => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Job Title</label>
                <Input
                  placeholder="e.g., Head Chef, Barista"
                  value={formData.job_title}
                  onChange={(e) => updateFormField('job_title', e.target.value)}
                  className="h-12 rounded-lg"
                />
                {errors.job_title && <p className="text-red-500 text-sm mt-1">{errors.job_title}</p>}
              </div>

              <div>
                <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Role Type</label>
                <Select value={formData.role_type} onValueChange={(value) => updateFormField('role_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="barista">Barista</SelectItem>
                    <SelectItem value="chef">Chef</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="bartender">Bartender</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="kitchen_porter">Kitchen Porter</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role_type && <p className="text-red-500 text-sm mt-1">{errors.role_type}</p>}
              </div>

              <div>
                <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Employment Type</label>
                <Select value={formData.employment_type} onValueChange={(value) => updateFormField('employment_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-Time</SelectItem>
                    <SelectItem value="part_time">Part-Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Job Description</label>
                <Textarea
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  value={formData.description}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  className="h-32 rounded-lg"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Requirements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Minimum Experience (years)</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => updateFormField('experience_years', parseInt(e.target.value) || 0)}
                  className="h-12 rounded-lg"
                />
                {errors.experience_years && <p className="text-red-500 text-sm mt-1">{errors.experience_years}</p>}
              </div>

              <div>
                <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Required Skills</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="skill-input"
                      placeholder="e.g., Espresso, Customer Service"
                      className="h-12 rounded-lg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target;
                          addArrayField('skills_required', input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.getElementById('skill-input');
                        addArrayField('skills_required', input.value);
                        input.value = '';
                      }}
                      className="px-6 rounded-lg"
                      style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
                    >
                      Add
                    </Button>
                  </div>
                  {formData.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills_required.map((skill, idx) => (
                        <div key={idx} className="px-3 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--sand)' }}>
                          <span className="text-sm">{skill}</span>
                          <button onClick={() => removeArrayField('skills_required', idx)} className="text-gray-500 hover:text-gray-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Key Responsibilities</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="responsibility-input"
                      placeholder="e.g., Prepare beverages"
                      className="h-12 rounded-lg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target;
                          addArrayField('responsibilities', input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.getElementById('responsibility-input');
                        addArrayField('responsibilities', input.value);
                        input.value = '';
                      }}
                      className="px-6 rounded-lg"
                      style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
                    >
                      Add
                    </Button>
                  </div>
                  {formData.responsibilities.length > 0 && (
                    <div className="space-y-2">
                      {formData.responsibilities.map((resp, idx) => (
                        <div key={idx} className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--sand)' }}>
                          <span className="text-sm">{resp}</span>
                          <button onClick={() => removeArrayField('responsibilities', idx)} className="text-gray-500 hover:text-gray-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Shift Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormField('start_date', e.target.value)}
                  className="h-12 rounded-lg"
                />
                {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
              </div>

              {formData.employment_type === 'part_time' && (
                <div>
                  <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Hours per Week</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g., 20"
                    value={formData.hours_per_week}
                    onChange={(e) => updateFormField('hours_per_week', e.target.value)}
                    className="h-12 rounded-lg"
                  />
                  {errors.hours_per_week && <p className="text-red-500 text-sm mt-1">{errors.hours_per_week}</p>}
                </div>
              )}

              {formData.employment_type === 'full_time' && (
                <div>
                  <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Hours per Week</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g., 40"
                    value={formData.hours_per_week}
                    onChange={(e) => updateFormField('hours_per_week', e.target.value)}
                    className="h-12 rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Location & Pay */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Location</label>
                <Input
                  placeholder="e.g., Dublin, Cork"
                  value={formData.location}
                  onChange={(e) => updateFormField('location', e.target.value)}
                  className="h-12 rounded-lg"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              {formData.employment_type === 'part_time' ? (
                <div>
                  <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Hourly Rate (EUR)</label>
                  <Input
                    type="number"
                    step="0.50"
                    min="0"
                    placeholder="e.g., 14.50"
                    value={formData.hourly_rate}
                    onChange={(e) => updateFormField('hourly_rate', e.target.value)}
                    className="h-12 rounded-lg"
                  />
                  {errors.hourly_rate && <p className="text-red-500 text-sm mt-1">{errors.hourly_rate}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Annual Salary Min (EUR)</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 30000"
                      value={formData.salary_min}
                      onChange={(e) => updateFormField('salary_min', e.target.value)}
                      className="h-12 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Annual Salary Max (EUR)</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 40000"
                      value={formData.salary_max}
                      onChange={(e) => updateFormField('salary_max', e.target.value)}
                      className="h-12 rounded-lg"
                    />
                  </div>
                  {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-light mb-2" style={{ color: 'var(--earth)' }}>Benefits</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="benefit-input"
                      placeholder="e.g., Health Insurance"
                      className="h-12 rounded-lg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target;
                          addArrayField('benefits', input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.getElementById('benefit-input');
                        addArrayField('benefits', input.value);
                        input.value = '';
                      }}
                      className="px-6 rounded-lg"
                      style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
                    >
                      Add
                    </Button>
                  </div>
                  {formData.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.benefits.map((benefit, idx) => (
                        <div key={idx} className="px-3 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--sand)' }}>
                          <span className="text-sm">{benefit}</span>
                          <button onClick={() => removeArrayField('benefits', idx)} className="text-gray-500 hover:text-gray-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--sand)' }}>
                <h3 className="font-light mb-4" style={{ color: 'var(--earth)' }}>Review Your Job Posting</h3>
                <div className="space-y-3 text-sm" style={{ color: 'var(--clay)' }}>
                  <div><strong>Title:</strong> {formData.job_title}</div>
                  <div><strong>Role:</strong> {formData.role_type}</div>
                  <div><strong>Type:</strong> {formData.employment_type === 'full_time' ? 'Full-Time' : 'Part-Time'}</div>
                  <div><strong>Location:</strong> {formData.location}</div>
                  <div><strong>Start Date:</strong> {formData.start_date}</div>
                  {formData.employment_type === 'part_time' && <div><strong>Rate:</strong> €{formData.hourly_rate}/hour</div>}
                  {formData.employment_type === 'full_time' && <div><strong>Salary:</strong> €{formData.salary_min} - €{formData.salary_max}</div>}
                  {formData.skills_required.length > 0 && <div><strong>Skills:</strong> {formData.skills_required.join(', ')}</div>}
                </div>
              </div>
              <p className="text-sm font-light" style={{ color: 'var(--clay)' }}>
                Click "Post Job" to publish this listing and start receiving applications.
              </p>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 1}
            variant="outline"
            className="px-6 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              className="px-8 rounded-lg"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createJobMutation.isPending || !selectedVenue}
              className="px-8 rounded-lg"
              style={{ backgroundColor: 'var(--sage)', color: 'white' }}
            >
              {createJobMutation.isPending ? 'Posting...' : 'Post Job'}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}