import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "../mobile/MobileSelect";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, CheckCircle2, Coffee, ChefHat, Shield, MapPin, Clock, DollarSign, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

const baristaSkillOptions = [
  "espresso", "latte_art", "filter", "pour_over", "cold_brew", 
  "customer_service", "training", "opening", "closing", "cash_handling", "management"
];

const chefSkillOptions = [
  "line_cook", "prep_cook", "grill", "saute", "pastry", 
  "sous_chef", "head_chef", "food_safety", "inventory", 
  "menu_planning", "plating", "butchery", "seafood", "vegetarian"
];

const dayOptions = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const visaHoursLimits = {
  "irish_citizen": null,
  "eu_citizen": null,
  "stamp_1": 39,
  "stamp_2": 20,
  "stamp_3": null,
  "stamp_4": null,
  "student_visa": 20
};

export default function WorkerOnboarding({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    worker_type: 'barista',
    visa_status: '',
    location: '',
    phone: '',
    bio: '',
    professional_summary: '',
    profile_picture_url: '',
    resume_url: '',
    experience_years: 0,
    barista_skills: [],
    chef_skills: [],
    availability: [],
    preferred_shift_times: [],
    desired_hourly_rate_min: '',
    desired_hourly_rate_max: ''
  });
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const totalSteps = 7;

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingPic(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_picture_url: file_url }));
      toast.success('Profile picture uploaded!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingCV(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, resume_url: file_url }));
      toast.success('CV uploaded!');
    } catch (error) {
      toast.error('Failed to upload CV');
    } finally {
      setUploadingCV(false);
    }
  };

  const generateSummary = async () => {
    setGeneratingAI(true);
    try {
      const skills = formData.worker_type === 'chef' ? formData.chef_skills : 
                     formData.worker_type === 'both' ? [...formData.barista_skills, ...formData.chef_skills] :
                     formData.barista_skills;
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional summary for a ${formData.worker_type} with ${formData.experience_years} years of experience in Irish hospitality. Skills: ${skills.join(', ')}. Location: ${formData.location}. Make it 2-3 sentences, professional but warm, highlighting key strengths. Don't use clichés.`,
      });
      
      setFormData(prev => ({ ...prev, professional_summary: result }));
      toast.success('Professional summary generated!');
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setGeneratingAI(false);
    }
  };

  const completeMutation = useMutation({
    mutationFn: async () => {
      const weeklyLimit = visaHoursLimits[formData.visa_status];
      await base44.auth.updateMe({
        ...formData,
        weekly_hours_limit: weeklyLimit,
        onboarding_completed: true
      });
    },
    onSuccess: () => {
      toast.success('Profile setup complete!');
      onComplete();
    }
  });

  const toggleSkill = (skill, type) => {
    const key = type === 'barista' ? 'barista_skills' : 'chef_skills';
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(skill)
        ? prev[key].filter(s => s !== skill)
        : [...prev[key], skill]
    }));
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const toggleShiftTime = (time) => {
    setFormData(prev => ({
      ...prev,
      preferred_shift_times: prev.preferred_shift_times.includes(time)
        ? prev.preferred_shift_times.filter(t => t !== time)
        : [...prev.preferred_shift_times, time]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.worker_type && formData.visa_status;
      case 2: return formData.location && formData.phone && formData.experience_years >= 0;
      case 3: 
        if (formData.worker_type === 'both') {
          return formData.barista_skills.length > 0 && formData.chef_skills.length > 0;
        }
        return formData.worker_type === 'chef' 
          ? formData.chef_skills.length > 0 
          : formData.barista_skills.length > 0;
      case 4: return formData.availability.length > 0 && formData.preferred_shift_times.length > 0;
      case 5: return formData.desired_hourly_rate_min && formData.desired_hourly_rate_max;
      case 6: return formData.bio;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-2xl w-full rounded-2xl p-8 my-8" style={{ backgroundColor: 'var(--warm-white)' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Welcome to Hospo
          </h1>
          <p className="text-lg" style={{ color: 'var(--clay)' }}>
            Let's set up your worker profile
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>
              STEP {step} OF {totalSteps}
            </span>
            <span className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>
              {Math.round((step / totalSteps) * 100)}% COMPLETE
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--sand)' }}>
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--terracotta)',
                width: `${(step / totalSteps) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8 min-h-[400px]">
          {/* Step 1: Role & Visa */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  What type of hospitality worker are you?
                </h2>
                <p className="text-sm mb-4" style={{ color: 'var(--clay)' }}>
                  This helps us match you with the right opportunities
                </p>
                <div className="flex flex-wrap gap-3">
                  {['barista', 'chef', 'both'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFormData(prev => ({ ...prev, worker_type: type }))}
                      className="flex items-center gap-2 px-6 py-4 rounded-xl transition-all font-normal"
                      style={formData.worker_type === type ? {
                        backgroundColor: type === 'chef' ? 'var(--sage)' : 'var(--terracotta)',
                        color: 'white',
                        border: 'none'
                      } : {
                        backgroundColor: 'transparent',
                        border: '2px solid var(--sand)',
                        color: 'var(--clay)'
                      }}
                    >
                      {type === 'barista' && <Coffee className="w-5 h-5" />}
                      {type === 'chef' && <ChefHat className="w-5 h-5" />}
                      {type === 'both' && <><Coffee className="w-5 h-5" /><ChefHat className="w-5 h-5" /></>}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-normal mb-3 block flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                  <Shield className="w-4 h-4" />
                  Work Authorization Status
                </label>
                <MobileSelect value={formData.visa_status} onValueChange={(value) => setFormData(prev => ({ ...prev, visa_status: value }))}>
                  <SelectTrigger className="rounded-xl border h-12" style={{ borderColor: 'var(--sand)' }}>
                    <SelectValue placeholder="Select your status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="irish_citizen">Irish Citizen</SelectItem>
                    <SelectItem value="eu_citizen">EU Citizen</SelectItem>
                    <SelectItem value="stamp_1">Stamp 1 (39h/week limit)</SelectItem>
                    <SelectItem value="stamp_2">Stamp 2 (20h/week limit)</SelectItem>
                    <SelectItem value="stamp_3">Stamp 3 (No restrictions)</SelectItem>
                    <SelectItem value="stamp_4">Stamp 4 (No restrictions)</SelectItem>
                    <SelectItem value="student_visa">Student Visa (20h/week limit)</SelectItem>
                  </SelectContent>
                </MobileSelect>
              </div>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Basic Information
              </h2>

              <div>
                <label className="text-sm font-normal mb-3 block">Profile Picture (Optional)</label>
                <div className="flex items-center gap-4">
                  {formData.profile_picture_url ? (
                    <img src={formData.profile_picture_url} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-light text-white" style={{ backgroundColor: 'var(--terracotta)' }}>
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <label>
                    <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" disabled={uploadingPic} />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      disabled={uploadingPic}
                      onClick={(e) => e.currentTarget.previousElementSibling.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {uploadingPic ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-normal mb-2 block flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                    <MapPin className="w-4 h-4" />
                    Location *
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Dublin, Ireland"
                    className="rounded-xl border h-12"
                    style={{ borderColor: 'var(--sand)' }}
                  />
                </div>

                <div>
                  <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>
                    Phone Number *
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+353..."
                    className="rounded-xl border h-12"
                    style={{ borderColor: 'var(--sand)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>
                  Years of Experience *
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) }))}
                  className="rounded-xl border h-12"
                  style={{ borderColor: 'var(--sand)' }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Skills */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Your Skills
              </h2>
              <p className="text-sm" style={{ color: 'var(--clay)' }}>
                Select all skills that apply to you
              </p>

              {(formData.worker_type === 'barista' || formData.worker_type === 'both') && (
                <div>
                  <label className="text-sm font-normal mb-3 block flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                    <Coffee className="w-4 h-4" />
                    Barista Skills *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {baristaSkillOptions.map(skill => (
                      <Badge
                        key={skill}
                        className="cursor-pointer transition-all hover-lift rounded-xl px-4 py-2"
                        style={formData.barista_skills.includes(skill) ? { 
                          backgroundColor: 'var(--terracotta)',
                          color: 'white'
                        } : {
                          backgroundColor: 'transparent',
                          border: '2px solid var(--sand)',
                          color: 'var(--clay)'
                        }}
                        onClick={() => toggleSkill(skill, 'barista')}
                      >
                        {skill.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(formData.worker_type === 'chef' || formData.worker_type === 'both') && (
                <div>
                  <label className="text-sm font-normal mb-3 block flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                    <ChefHat className="w-4 h-4" />
                    Chef Skills *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {chefSkillOptions.map(skill => (
                      <Badge
                        key={skill}
                        className="cursor-pointer transition-all hover-lift rounded-xl px-4 py-2"
                        style={formData.chef_skills.includes(skill) ? { 
                          backgroundColor: 'var(--sage)',
                          color: 'white'
                        } : {
                          backgroundColor: 'transparent',
                          border: '2px solid var(--sand)',
                          color: 'var(--clay)'
                        }}
                        onClick={() => toggleSkill(skill, 'chef')}
                      >
                        {skill.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Availability */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Your Availability
              </h2>

              <div>
                <label className="text-sm font-normal mb-3 block flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                  <Clock className="w-4 h-4" />
                  Available Days *
                </label>
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map(day => (
                    <Badge
                      key={day}
                      className="cursor-pointer transition-all hover-lift rounded-xl px-4 py-2"
                      style={formData.availability.includes(day) ? { 
                        backgroundColor: 'var(--sage)',
                        color: 'white'
                      } : {
                        backgroundColor: 'transparent',
                        border: '2px solid var(--sand)',
                        color: 'var(--clay)'
                      }}
                      onClick={() => toggleDay(day)}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-normal mb-3 block" style={{ color: 'var(--clay)' }}>
                  Preferred Shift Times *
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'early_morning', label: 'Early Morning (5am-9am)' },
                    { value: 'morning', label: 'Morning (9am-12pm)' },
                    { value: 'afternoon', label: 'Afternoon (12pm-5pm)' },
                    { value: 'evening', label: 'Evening (5pm-10pm)' },
                    { value: 'late_night', label: 'Late Night (10pm+)' }
                  ].map(time => (
                    <Badge
                      key={time.value}
                      className="cursor-pointer transition-all hover-lift rounded-xl px-4 py-2"
                      style={formData.preferred_shift_times.includes(time.value) ? { 
                        backgroundColor: 'var(--olive)',
                        color: 'white'
                      } : {
                        backgroundColor: 'transparent',
                        border: '2px solid var(--sand)',
                        color: 'var(--clay)'
                      }}
                      onClick={() => toggleShiftTime(time.value)}
                    >
                      {time.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Desired Rates */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Your Desired Hourly Rate
              </h2>
              <p className="text-sm" style={{ color: 'var(--clay)' }}>
                This helps employers understand your expectations
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-normal mb-2 block flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                    <DollarSign className="w-4 h-4" />
                    Minimum Rate *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-normal" style={{ color: 'var(--clay)' }}>€</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.50"
                      value={formData.desired_hourly_rate_min}
                      onChange={(e) => setFormData(prev => ({ ...prev, desired_hourly_rate_min: parseFloat(e.target.value) }))}
                      placeholder="12.00"
                      className="rounded-xl border h-12 pl-8"
                      style={{ borderColor: 'var(--sand)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>
                    Maximum Rate *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-normal" style={{ color: 'var(--clay)' }}>€</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.50"
                      value={formData.desired_hourly_rate_max}
                      onChange={(e) => setFormData(prev => ({ ...prev, desired_hourly_rate_max: parseFloat(e.target.value) }))}
                      placeholder="18.00"
                      className="rounded-xl border h-12 pl-8"
                      style={{ borderColor: 'var(--sand)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: About & CV */}
          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Tell Us About Yourself
              </h2>

              <div>
                <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>
                  About Me *
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell employers about your experience, passion for hospitality, and what makes you a great worker..."
                  className="rounded-xl border"
                  style={{ borderColor: 'var(--sand)' }}
                  rows={4}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-normal" style={{ color: 'var(--clay)' }}>
                    Professional Summary (Optional)
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateSummary}
                    disabled={generatingAI}
                    className="rounded-xl text-xs"
                    style={{ borderColor: 'var(--terracotta)', color: 'var(--terracotta)' }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {generatingAI ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <Textarea
                  value={formData.professional_summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, professional_summary: e.target.value }))}
                  placeholder="A compelling professional summary..."
                  className="rounded-xl border"
                  style={{ borderColor: 'var(--sand)' }}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>
                  Upload CV/Resume (Optional)
                </label>
                {formData.resume_url ? (
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
                    <span className="text-sm" style={{ color: 'var(--earth)' }}>CV uploaded</span>
                    <Button size="sm" variant="ghost" onClick={() => setFormData(prev => ({ ...prev, resume_url: '' }))}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleCVUpload} className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl w-full"
                      disabled={uploadingCV}
                      onClick={(e) => e.currentTarget.previousElementSibling.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingCV ? 'Uploading...' : 'Upload CV'}
                    </Button>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="rounded-xl font-normal"
              style={{ borderColor: 'var(--sand)', color: 'var(--clay)' }}
            >
              Back
            </Button>
          )}
          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 rounded-xl font-normal"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={() => completeMutation.mutate()}
              disabled={!canProceed() || completeMutation.isPending}
              className="flex-1 rounded-xl font-normal flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--sage)', color: 'white' }}
            >
              <CheckCircle2 className="w-5 h-5" />
              {completeMutation.isPending ? 'Completing...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}