import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Star, Briefcase, Award, MapPin, X, Upload, Shield, Clock, Coffee, ChefHat, Sparkles, FileText, Camera, Trash2, Plus, AlertTriangle, LogOut } from "lucide-react";
import { toast } from "sonner";
import MobileHeader from "../components/mobile/MobileHeader";
import { createPageUrl } from "@/utils";

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

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [extractingCV, setExtractingCV] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(userData => {
      setUser(userData);
      setFormData({
        bio: userData.bio || '',
        professional_summary: userData.professional_summary || '',
        profile_picture_url: userData.profile_picture_url || '',
        resume_url: userData.resume_url || '',
        location: userData.location || '',
        phone: userData.phone || '',
        worker_type: userData.worker_type || 'barista',
        visa_status: userData.visa_status || '',
        experience_years: userData.experience_years || 0,
        barista_skills: userData.barista_skills || userData.skills || [],
        chef_skills: userData.chef_skills || [],
        certifications: userData.certifications || [],
        availability: userData.availability || [],
        availability_slots: userData.availability_slots || [],
        preferred_shift_times: userData.preferred_shift_times || [],
        desired_hourly_rate_min: userData.desired_hourly_rate_min || '',
        desired_hourly_rate_max: userData.desired_hourly_rate_max || '',
        work_experience: userData.work_experience || [],
        skill_portfolio: userData.skill_portfolio || []
      });
    }).catch(() => {});
  }, []);

  const { data: workerReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['workerReviews', user?.email],
    queryFn: () => base44.entities.WorkerReview.filter({ worker_email: user?.email }),
    initialData: [],
    enabled: !!user?.email
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => {
      const weeklyLimit = visaHoursLimits[data.visa_status];
      return base44.auth.updateMe({
        ...data,
        weekly_hours_limit: weeklyLimit
      });
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated successfully');
    },
  });

  const toggleBaristaSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      barista_skills: prev.barista_skills.includes(skill)
        ? prev.barista_skills.filter(s => s !== skill)
        : [...prev.barista_skills, skill]
    }));
  };

  const toggleChefSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      chef_skills: prev.chef_skills.includes(skill)
        ? prev.chef_skills.filter(s => s !== skill)
        : [...prev.chef_skills, skill]
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

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      work_experience: [...prev.work_experience, {
        job_title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        current: false,
        description: ''
      }]
    }));
  };

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== index)
    }));
  };

  const updateWorkExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const generateProfessionalSummary = async () => {
    setIsGeneratingAI(true);
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
      setIsGeneratingAI(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingProfilePic(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_picture_url: file_url }));
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingResume(true);
    setExtractingCV(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, resume_url: file_url }));
      toast.success('Resume uploaded!');
      
      // Extract work experience from CV
      try {
        const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: file_url,
          json_schema: {
            type: "object",
            properties: {
              work_experience: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    job_title: { type: "string" },
                    company: { type: "string" },
                    location: { type: "string" },
                    start_date: { type: "string" },
                    end_date: { type: "string" },
                    current: { type: "boolean" },
                    description: { type: "string" }
                  }
                }
              }
            }
          }
        });
        
        if (result.status === 'success' && result.output?.work_experience) {
          setFormData(prev => ({ ...prev, work_experience: result.output.work_experience }));
          toast.success('Work experience extracted from CV!');
        }
      } catch (extractError) {
        console.error('Failed to extract CV data:', extractError);
      }
    } catch (error) {
      toast.error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
      setExtractingCV(false);
    }
  };

  const handlePortfolioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingPortfolio(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newItem = {
        title: 'Portfolio Item',
        description: '',
        image_url: file_url,
        date: new Date().toISOString().split('T')[0]
      };
      setFormData(prev => ({ 
        ...prev, 
        skill_portfolio: [...prev.skill_portfolio, newItem]
      }));
      toast.success('Portfolio image added!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const removePortfolioItem = (index) => {
    setFormData(prev => ({
      ...prev,
      skill_portfolio: prev.skill_portfolio.filter((_, i) => i !== index)
    }));
  };

  const updatePortfolioItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      skill_portfolio: prev.skill_portfolio.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', date_obtained: '' }]
    }));
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const updateCertification = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const handleSubmit = () => {
    updateProfileMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
      </div>
    );
  }

  return (
    <>
      <MobileHeader title="My Profile" icon={User} />
      <div className="min-h-screen p-6 md:p-12 md:pt-12 pt-24" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 border rounded-2xl overflow-hidden" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <div className="h-32" style={{ backgroundColor: 'var(--sand)' }} />
          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-12">
              <div className="relative group">
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={uploadingProfilePic}
                    />
                    <Camera className="w-8 h-8 text-white" />
                  </label>
                )}
                {formData.profile_picture_url || user.profile_picture_url ? (
                  <img 
                    src={formData.profile_picture_url || user.profile_picture_url} 
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 object-cover" 
                    style={{ borderColor: 'var(--warm-white)' }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-light text-white" style={{ backgroundColor: 'var(--terracotta)', borderColor: 'var(--warm-white)', fontFamily: 'Crimson Pro, serif' }}>
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
                <h1 className="text-3xl font-normal mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  {user.full_name}
                </h1>
                <p className="font-light" style={{ color: 'var(--clay)' }}>{user.email}</p>
                {user.visa_status && (
                  <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                    <Shield className="w-4 h-4" style={{ color: 'var(--sage)' }} />
                    <span className="text-sm font-normal" style={{ color: 'var(--clay)' }}>
                      {user.visa_status.replace(/_/g, ' ').toUpperCase()}
                      {user.weekly_hours_limit && ` • ${user.weekly_hours_limit}h/week limit`}
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
                disabled={updateProfileMutation.isPending}
                className="rounded-xl font-normal tracking-wide"
                style={{ backgroundColor: isEditing ? 'var(--terracotta)' : 'var(--earth)', color: 'white' }}
              >
                {updateProfileMutation.isPending ? 'Saving...' : isEditing ? 'Save Profile' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-4 gap-5 mb-8">
          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardContent className="p-6 text-center">
              <Briefcase className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--sage)', strokeWidth: 1.5 }} />
              <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {user.shifts_completed || 0}
              </div>
              <div className="text-xs tracking-wider font-light" style={{ color: 'var(--clay)' }}>SHIFTS DONE</div>
            </CardContent>
          </Card>

          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 fill-current" style={{ color: 'var(--terracotta)', strokeWidth: 1.5 }} />
              <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {user.rating > 0 ? user.rating.toFixed(1) : 'New'}
              </div>
              <div className="text-xs tracking-wider font-light" style={{ color: 'var(--clay)' }}>EMPLOYER RATING</div>
            </CardContent>
          </Card>

          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
              <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {user.experience_years || 0}y
              </div>
              <div className="text-xs tracking-wider font-light" style={{ color: 'var(--clay)' }}>EXPERIENCE</div>
            </CardContent>
          </Card>

          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--olive)', strokeWidth: 1.5 }} />
              <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {user.hours_worked_this_week || 0}
              </div>
              <div className="text-xs tracking-wider font-light" style={{ color: 'var(--clay)' }}>HOURS THIS WEEK</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border rounded-2xl mb-8" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Work Authorization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
                VISA / CITIZENSHIP STATUS *
              </label>
              {isEditing ? (
                <Select value={formData.visa_status} onValueChange={(value) => setFormData(prev => ({ ...prev, visa_status: value }))}>
                  <SelectTrigger className="rounded-xl border" style={{ borderColor: 'var(--sand)' }}>
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
                </Select>
              ) : (
                <p className="font-normal text-lg" style={{ color: 'var(--earth)' }}>
                  {user.visa_status ? user.visa_status.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Not set'}
                  {user.weekly_hours_limit && (
                    <span className="text-sm ml-2" style={{ color: 'var(--clay)' }}>
                      ({user.weekly_hours_limit} hours per week maximum)
                    </span>
                  )}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Worker Type */}
        <Card className="border rounded-2xl mb-8" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Worker Type</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="flex flex-wrap gap-3">
                {['barista', 'chef', 'both'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, worker_type: type }))}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-normal"
                    style={formData.worker_type === type ? {
                      backgroundColor: type === 'chef' ? 'var(--sage)' : 'var(--terracotta)',
                      color: 'white',
                      border: 'none'
                    } : {
                      backgroundColor: 'transparent',
                      border: '1px solid var(--sand)',
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
            ) : (
              <div className="flex items-center gap-2">
                {(user.worker_type === 'barista' || user.worker_type === 'both') && <Coffee className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />}
                {(user.worker_type === 'chef' || user.worker_type === 'both') && <ChefHat className="w-5 h-5" style={{ color: 'var(--sage)' }} />}
                <span className="font-normal text-lg" style={{ color: 'var(--earth)' }}>
                  {user.worker_type ? user.worker_type.charAt(0).toUpperCase() + user.worker_type.slice(1) : 'Barista'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Summary & Resume */}
        <Card className="border rounded-2xl mb-8" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Professional Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs tracking-wider font-normal" style={{ color: 'var(--clay)' }}>
                  PROFESSIONAL SUMMARY
                </label>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateProfessionalSummary}
                    disabled={isGeneratingAI}
                    className="rounded-xl text-xs"
                    style={{ borderColor: 'var(--terracotta)', color: 'var(--terracotta)' }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
                  </Button>
                )}
              </div>
              {isEditing ? (
                <Textarea
                  value={formData.professional_summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, professional_summary: e.target.value }))}
                  placeholder="A compelling professional summary that highlights your expertise..."
                  className="rounded-xl border font-light"
                  style={{ borderColor: 'var(--sand)' }}
                  rows={3}
                />
              ) : (
                <p className="font-light text-lg" style={{ color: 'var(--earth)' }}>
                  {user.professional_summary || 'No professional summary yet'}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
                RESUME / CV
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  {formData.resume_url && (
                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" style={{ color: 'var(--clay)' }} />
                        <span className="text-sm" style={{ color: 'var(--earth)' }}>Resume uploaded</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setFormData(prev => ({ ...prev, resume_url: '' }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <label className="block">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl font-normal w-full"
                      style={{ borderColor: 'var(--sand)' }}
                      disabled={uploadingResume}
                      onClick={(e) => e.currentTarget.previousElementSibling.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingResume ? 'Uploading...' : formData.resume_url ? 'Replace Resume' : 'Upload Resume'}
                    </Button>
                  </label>
                </div>
              ) : user.resume_url ? (
                <a 
                  href={user.resume_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl hover-lift"
                  style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}
                >
                  <FileText className="w-4 h-4" />
                  View Resume
                </a>
              ) : (
                <p className="font-light" style={{ color: 'var(--clay)' }}>No resume uploaded</p>
              )}
            </div>

            <div>
              <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
                BIO
              </label>
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="rounded-xl border font-light"
                  style={{ borderColor: 'var(--sand)' }}
                  rows={3}
                />
              ) : (
                <p className="font-light" style={{ color: 'var(--earth)' }}>
                  {user.bio || 'No bio added yet'}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
                  LOCATION *
                </label>
                {isEditing ? (
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Dublin, Ireland"
                    className="rounded-xl border"
                    style={{ borderColor: 'var(--sand)' }}
                  />
                ) : (
                  <div className="flex items-center gap-2 font-light" style={{ color: 'var(--earth)' }}>
                    <MapPin className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
                    {user.location || 'Not specified'}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
                  PHONE *
                </label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+353..."
                    className="rounded-xl border"
                    style={{ borderColor: 'var(--sand)' }}
                  />
                ) : (
                  <p className="font-light" style={{ color: 'var(--earth)' }}>
                    {user.phone || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
                  YEARS OF EXPERIENCE *
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) }))}
                    className="rounded-xl border"
                    style={{ borderColor: 'var(--sand)' }}
                  />
                ) : (
                  <p className="font-light" style={{ color: 'var(--earth)' }}>
                    {user.experience_years || 0} years
                  </p>
                )}
              </div>
            </div>

            {/* Barista Skills */}
            {(formData.worker_type === 'barista' || formData.worker_type === 'both' || !formData.worker_type) && (
              <div>
                <label className="text-xs tracking-wider mb-3 block font-normal flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                  <Coffee className="w-4 h-4" />
                  BARISTA SKILLS
                </label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {baristaSkillOptions.map(skill => (
                      <Badge
                        key={skill}
                        className="cursor-pointer transition-all duration-200 hover-lift rounded-xl px-3 py-1.5 font-normal tracking-wide"
                        style={formData.barista_skills?.includes(skill) ? { 
                          backgroundColor: 'var(--terracotta)',
                          color: 'white',
                          border: 'none'
                        } : {
                          backgroundColor: 'transparent',
                          border: '1px solid var(--sand)',
                          color: 'var(--clay)'
                        }}
                        onClick={() => toggleBaristaSkill(skill)}
                      >
                        {skill.replace(/_/g, ' ')}
                        {formData.barista_skills?.includes(skill) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(user.barista_skills || user.skills) && (user.barista_skills || user.skills).length > 0 ? (
                      (user.barista_skills || user.skills).map((skill, idx) => (
                        <Badge key={idx} className="border-0 font-normal" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}>
                          {skill.replace(/_/g, ' ')}
                        </Badge>
                      ))
                    ) : (
                      <p className="font-light" style={{ color: 'var(--clay)' }}>No barista skills added yet</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Chef Skills */}
            {(formData.worker_type === 'chef' || formData.worker_type === 'both') && (
              <div>
                <label className="text-xs tracking-wider mb-3 block font-normal flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                  <ChefHat className="w-4 h-4" />
                  CHEF / KITCHEN SKILLS
                </label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {chefSkillOptions.map(skill => (
                      <Badge
                        key={skill}
                        className="cursor-pointer transition-all duration-200 hover-lift rounded-xl px-3 py-1.5 font-normal tracking-wide"
                        style={formData.chef_skills?.includes(skill) ? { 
                          backgroundColor: 'var(--sage)',
                          color: 'white',
                          border: 'none'
                        } : {
                          backgroundColor: 'transparent',
                          border: '1px solid var(--sand)',
                          color: 'var(--clay)'
                        }}
                        onClick={() => toggleChefSkill(skill)}
                      >
                        {skill.replace(/_/g, ' ')}
                        {formData.chef_skills?.includes(skill) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.chef_skills && user.chef_skills.length > 0 ? (
                      user.chef_skills.map((skill, idx) => (
                        <Badge key={idx} className="border-0 font-normal" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
                          {skill.replace(/_/g, ' ')}
                        </Badge>
                      ))
                    ) : (
                      <p className="font-light" style={{ color: 'var(--clay)' }}>No chef skills added yet</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-xs tracking-wider mb-3 block font-normal" style={{ color: 'var(--clay)' }}>
                AVAILABILITY *
              </label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map(day => (
                    <Badge
                      key={day}
                      className="cursor-pointer transition-all duration-200 hover-lift rounded-xl px-3 py-1.5 font-normal tracking-wide"
                      style={formData.availability.includes(day) ? { 
                        backgroundColor: 'var(--sage)',
                        color: 'white',
                        border: 'none'
                      } : {
                        backgroundColor: 'transparent',
                        border: '1px solid var(--sand)',
                        color: 'var(--clay)'
                      }}
                      onClick={() => toggleDay(day)}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                      {formData.availability.includes(day) && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.availability && user.availability.length > 0 ? (
                    user.availability.map((day, idx) => (
                      <Badge key={idx} className="border-0 font-normal" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Badge>
                    ))
                  ) : (
                    <p className="font-light" style={{ color: 'var(--clay)' }}>No availability set</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
                PREFERRED SHIFT TIMES
              </label>
              {isEditing ? (
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
                      className="cursor-pointer transition-all duration-200 hover-lift rounded-xl px-3 py-1.5 font-normal tracking-wide"
                      style={formData.preferred_shift_times.includes(time.value) ? { 
                        backgroundColor: 'var(--olive)',
                        color: 'white',
                        border: 'none'
                      } : {
                        backgroundColor: 'transparent',
                        border: '1px solid var(--sand)',
                        color: 'var(--clay)'
                      }}
                      onClick={() => toggleShiftTime(time.value)}
                    >
                      {time.label}
                      {formData.preferred_shift_times.includes(time.value) && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              ) : user.preferred_shift_times && user.preferred_shift_times.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.preferred_shift_times.map((time, idx) => (
                    <Badge key={idx} className="border-0 font-normal" style={{ backgroundColor: 'var(--olive)', color: 'white' }}>
                      {time.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="font-light" style={{ color: 'var(--clay)' }}>No preferences set</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
                  DESIRED HOURLY RATE (MIN)
                </label>
                {isEditing ? (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-normal" style={{ color: 'var(--clay)' }}>€</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.50"
                      value={formData.desired_hourly_rate_min}
                      onChange={(e) => setFormData(prev => ({ ...prev, desired_hourly_rate_min: parseFloat(e.target.value) }))}
                      placeholder="12.00"
                      className="rounded-xl border pl-8"
                      style={{ borderColor: 'var(--sand)' }}
                    />
                  </div>
                ) : (
                  <p className="font-light text-lg" style={{ color: 'var(--earth)' }}>
                    {user.desired_hourly_rate_min ? `€${user.desired_hourly_rate_min}/hr` : 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs tracking-wider mb-2 block font-normal" style={{ color: 'var(--clay)' }}>
                  DESIRED HOURLY RATE (MAX)
                </label>
                {isEditing ? (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-normal" style={{ color: 'var(--clay)' }}>€</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.50"
                      value={formData.desired_hourly_rate_max}
                      onChange={(e) => setFormData(prev => ({ ...prev, desired_hourly_rate_max: parseFloat(e.target.value) }))}
                      placeholder="18.00"
                      className="rounded-xl border pl-8"
                      style={{ borderColor: 'var(--sand)' }}
                    />
                  </div>
                ) : (
                  <p className="font-light text-lg" style={{ color: 'var(--earth)' }}>
                    {user.desired_hourly_rate_max ? `€${user.desired_hourly_rate_max}/hr` : 'Not set'}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={updateProfileMutation.isPending}
                  className="rounded-xl font-normal tracking-wide"
                  style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      bio: user.bio || '',
                      professional_summary: user.professional_summary || '',
                      profile_picture_url: user.profile_picture_url || '',
                      resume_url: user.resume_url || '',
                      location: user.location || '',
                      phone: user.phone || '',
                      worker_type: user.worker_type || 'barista',
                      visa_status: user.visa_status || '',
                      experience_years: user.experience_years || 0,
                      barista_skills: user.barista_skills || user.skills || [],
                      chef_skills: user.chef_skills || [],
                      certifications: user.certifications || [],
                      availability: user.availability || [],
                      availability_slots: user.availability_slots || [],
                      preferred_shift_times: user.preferred_shift_times || [],
                      desired_hourly_rate_min: user.desired_hourly_rate_min || '',
                      desired_hourly_rate_max: user.desired_hourly_rate_max || '',
                      work_experience: user.work_experience || [],
                      skill_portfolio: user.skill_portfolio || []
                    });
                  }}
                  className="rounded-xl font-normal tracking-wide"
                  style={{ borderColor: 'var(--sand)', color: 'var(--clay)' }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Experience */}
        <Card className="border rounded-2xl mb-8" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Work Experience
              </CardTitle>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addWorkExperience}
                  className="rounded-xl"
                  style={{ borderColor: 'var(--sand)' }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              )}
            </div>
            {extractingCV && (
              <p className="text-sm mt-2" style={{ color: 'var(--clay)' }}>
                <Sparkles className="w-4 h-4 inline mr-1" />
                Extracting experience from CV...
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              formData.work_experience.length > 0 ? (
                formData.work_experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl space-y-3" style={{ backgroundColor: 'var(--cream)', border: '1px solid var(--sand)' }}>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeWorkExperience(idx)}
                      >
                        <Trash2 className="w-4 h-4" style={{ color: 'var(--clay)' }} />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Job title"
                        value={exp.job_title || ''}
                        onChange={(e) => updateWorkExperience(idx, 'job_title', e.target.value)}
                        className="rounded-xl border"
                        style={{ borderColor: 'var(--sand)' }}
                      />
                      <Input
                        placeholder="Company name"
                        value={exp.company || ''}
                        onChange={(e) => updateWorkExperience(idx, 'company', e.target.value)}
                        className="rounded-xl border"
                        style={{ borderColor: 'var(--sand)' }}
                      />
                    </div>
                    <Input
                      placeholder="Location"
                      value={exp.location || ''}
                      onChange={(e) => updateWorkExperience(idx, 'location', e.target.value)}
                      className="rounded-xl border"
                      style={{ borderColor: 'var(--sand)' }}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="month"
                        placeholder="Start date"
                        value={exp.start_date || ''}
                        onChange={(e) => updateWorkExperience(idx, 'start_date', e.target.value)}
                        className="rounded-xl border"
                        style={{ borderColor: 'var(--sand)' }}
                      />
                      {!exp.current && (
                        <Input
                          type="month"
                          placeholder="End date"
                          value={exp.end_date || ''}
                          onChange={(e) => updateWorkExperience(idx, 'end_date', e.target.value)}
                          className="rounded-xl border"
                          style={{ borderColor: 'var(--sand)' }}
                        />
                      )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.current || false}
                        onChange={(e) => updateWorkExperience(idx, 'current', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm" style={{ color: 'var(--clay)' }}>I currently work here</span>
                    </label>
                    <Textarea
                      placeholder="Job description and achievements"
                      value={exp.description || ''}
                      onChange={(e) => updateWorkExperience(idx, 'description', e.target.value)}
                      className="rounded-xl border"
                      style={{ borderColor: 'var(--sand)' }}
                      rows={3}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm font-light text-center py-8" style={{ color: 'var(--clay)' }}>
                  No work experience added yet. Upload a CV to auto-extract or add manually.
                </p>
              )
            ) : user.work_experience && user.work_experience.length > 0 ? (
              user.work_experience.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl border-l-4" style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--terracotta)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-normal text-lg" style={{ color: 'var(--earth)' }}>{exp.job_title}</h4>
                      <p className="text-sm font-light" style={{ color: 'var(--clay)' }}>{exp.company}</p>
                    </div>
                    {exp.current && (
                      <Badge className="border-0" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>Current</Badge>
                    )}
                  </div>
                  {exp.location && (
                    <p className="text-sm mb-1" style={{ color: 'var(--clay)' }}>
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {exp.location}
                    </p>
                  )}
                  {exp.start_date && (
                    <p className="text-xs mb-2" style={{ color: 'var(--clay)' }}>
                      {exp.start_date} - {exp.current ? 'Present' : exp.end_date || 'N/A'}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-sm font-light mt-2" style={{ color: 'var(--earth)' }}>{exp.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="font-light text-center py-8" style={{ color: 'var(--clay)' }}>
                No work experience added yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card className="border rounded-2xl mb-8" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Certifications
              </CardTitle>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addCertification}
                  className="rounded-xl"
                  style={{ borderColor: 'var(--sand)' }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              formData.certifications.length > 0 ? (
                formData.certifications.map((cert, idx) => (
                  <div key={idx} className="p-4 rounded-xl space-y-3" style={{ backgroundColor: 'var(--cream)', border: '1px solid var(--sand)' }}>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCertification(idx)}
                      >
                        <Trash2 className="w-4 h-4" style={{ color: 'var(--clay)' }} />
                      </Button>
                    </div>
                    <Input
                      placeholder="Certification name (e.g., Food Safety Level 2)"
                      value={cert.name || ''}
                      onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                      className="rounded-xl border"
                      style={{ borderColor: 'var(--sand)' }}
                    />
                    <Input
                      placeholder="Issuing organization"
                      value={cert.issuer || ''}
                      onChange={(e) => updateCertification(idx, 'issuer', e.target.value)}
                      className="rounded-xl border"
                      style={{ borderColor: 'var(--sand)' }}
                    />
                    <Input
                      type="date"
                      placeholder="Date obtained"
                      value={cert.date_obtained || ''}
                      onChange={(e) => updateCertification(idx, 'date_obtained', e.target.value)}
                      className="rounded-xl border"
                      style={{ borderColor: 'var(--sand)' }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm font-light text-center py-8" style={{ color: 'var(--clay)' }}>
                  No certifications added yet. Click "Add" to get started.
                </p>
              )
            ) : user.certifications && user.certifications.length > 0 ? (
              user.certifications.map((cert, idx) => (
                <div key={idx} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 mt-1" style={{ color: 'var(--terracotta)' }} />
                    <div className="flex-1">
                      <h4 className="font-normal text-lg" style={{ color: 'var(--earth)' }}>{cert.name}</h4>
                      {cert.issuer && (
                        <p className="text-sm" style={{ color: 'var(--clay)' }}>{cert.issuer}</p>
                      )}
                      {cert.date_obtained && (
                        <p className="text-xs mt-1" style={{ color: 'var(--clay)' }}>
                          Obtained: {new Date(cert.date_obtained).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-light text-center py-8" style={{ color: 'var(--clay)' }}>
                No certifications added yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card className="border rounded-2xl mb-8" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Portfolio {user.worker_type === 'chef' ? '(Plated Dishes)' : user.worker_type === 'barista' ? '(Latte Art & Coffee)' : ''}
              </CardTitle>
              {isEditing && (
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortfolioUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    style={{ borderColor: 'var(--sand)' }}
                    disabled={uploadingPortfolio}
                    onClick={(e) => e.currentTarget.previousElementSibling.click()}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    {uploadingPortfolio ? 'Uploading...' : 'Add Photo'}
                  </Button>
                </label>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              formData.skill_portfolio.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.skill_portfolio.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full aspect-square object-cover rounded-xl"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        onClick={() => removePortfolioItem(idx)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Input
                        placeholder="Title"
                        value={item.title || ''}
                        onChange={(e) => updatePortfolioItem(idx, 'title', e.target.value)}
                        className="mt-2 rounded-xl border"
                        style={{ borderColor: 'var(--sand)' }}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={item.description || ''}
                        onChange={(e) => updatePortfolioItem(idx, 'description', e.target.value)}
                        className="mt-2 rounded-xl border"
                        style={{ borderColor: 'var(--sand)' }}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-light text-center py-12" style={{ color: 'var(--clay)' }}>
                  No portfolio items yet. Click "Add Photo" to showcase your work.
                </p>
              )
            ) : user.skill_portfolio && user.skill_portfolio.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {user.skill_portfolio.map((item, idx) => (
                  <div key={idx} className="group cursor-pointer">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full aspect-square object-cover rounded-xl hover-lift"
                    />
                    {item.title && (
                      <h5 className="mt-2 font-normal" style={{ color: 'var(--earth)' }}>{item.title}</h5>
                    )}
                    {item.description && (
                      <p className="text-sm font-light mt-1" style={{ color: 'var(--clay)' }}>{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-light text-center py-12" style={{ color: 'var(--clay)' }}>
                No portfolio items yet
              </p>
            )}
          </CardContent>
        </Card>

        {workerReviews && workerReviews.length > 0 && (
          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardHeader>
              <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Employer Reviews ({workerReviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workerReviews.map((review, idx) => (
                <div key={idx} className="p-5 rounded-xl border" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--cream)' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-normal text-lg" style={{ color: 'var(--earth)' }}>{review.coffee_shop_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4" style={{ color: i < review.rating ? 'var(--terracotta)' : 'var(--sand)', fill: i < review.rating ? 'var(--terracotta)' : 'none' }} />
                          ))}
                        </div>
                        <span className="text-sm" style={{ color: 'var(--clay)' }}>{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    {review.would_hire_again && (
                      <Badge className="border-0" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>Would Hire Again</Badge>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-sm font-light mb-3" style={{ color: 'var(--earth)' }}>{review.comment}</p>
                  )}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="tracking-wider" style={{ color: 'var(--clay)' }}>PUNCTUALITY:</span>
                      <span className="ml-2 font-normal" style={{ color: 'var(--earth)' }}>{review.punctuality_rating}/5</span>
                    </div>
                    <div>
                      <span className="tracking-wider" style={{ color: 'var(--clay)' }}>SKILL:</span>
                      <span className="ml-2 font-normal" style={{ color: 'var(--earth)' }}>{review.skill_rating}/5</span>
                    </div>
                    <div>
                      <span className="tracking-wider" style={{ color: 'var(--clay)' }}>ATTITUDE:</span>
                      <span className="ml-2 font-normal" style={{ color: 'var(--earth)' }}>{review.attitude_rating}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {/* Logout and Delete Account Section */}
        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => {
                base44.auth.logout();
                window.location.href = createPageUrl('Welcome');
              }}
              variant="outline"
              className="w-full rounded-xl font-normal"
              style={{ borderColor: 'var(--sand)', color: 'var(--clay)' }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              className="w-full rounded-xl font-normal"
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full rounded-2xl p-6" style={{ backgroundColor: 'var(--warm-white)' }}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h3 className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Delete Account?
              </h3>
            </div>
            <p className="mb-6" style={{ color: 'var(--clay)' }}>
              This action cannot be undone. Your profile, shift history, applications, and all data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 rounded-xl font-normal"
                style={{ borderColor: 'var(--sand)' }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await base44.auth.updateMe({ is_deleted: true });
                    await base44.auth.logout();
                    window.location.href = createPageUrl('Welcome');
                  } catch (error) {
                    toast.error('Failed to delete account');
                  }
                }}
                className="flex-1 rounded-xl font-normal"
              >
                Delete Forever
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}