import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "../mobile/MobileSelect";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, CheckCircle2, Coffee, ChefHat, Shield, MapPin, Clock, DollarSign, Sparkles, X, Briefcase } from "lucide-react";
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
    legal_first_name: '',
    legal_last_name: '',
    pps_number: '',
    identity_document_url: '',
    identity_verified: false,
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
  const [uploadingIdentity, setUploadingIdentity] = useState(false);
  const [verifyingIdentity, setVerifyingIdentity] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const [visaDocumentUrl, setVisaDocumentUrl] = useState('');
  const [visaDocumentVerified, setVisaDocumentVerified] = useState(false);
  const [verifyingVisa, setVerifyingVisa] = useState(false);
  const [uploadingVisaDoc, setUploadingVisaDoc] = useState(false);

  const requiresVisaDoc = (status) => !['irish_citizen', 'eu_citizen', ''].includes(status);

  const totalSteps = requiresVisaDoc(formData.visa_status) ? 9 : 8;

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

  const handleIdentityUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingIdentity(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, identity_document_url: file_url }));
      toast.success('Document uploaded! Now verifying...');
      
      // Automatically verify the document
      await verifyIdentity(file_url);
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploadingIdentity(false);
    }
  };

  const handleVisaDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingVisaDoc(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setVisaDocumentUrl(file_url);
      toast.success('Document uploaded! Verifying...');
      await verifyVisaDocument(file_url);
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploadingVisaDoc(false);
    }
  };

  const verifyVisaDocument = async (documentUrl) => {
    setVerifyingVisa(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an Irish immigration document verification system. Analyze this document image and determine if it is a valid Irish work authorization document (IRP card, GNIB card, stamp, visa, work permit, or similar). 
        
        Check:
        1. Is this a genuine-looking official document?
        2. Does it appear valid and not expired?
        3. Does the name on the document match: ${formData.legal_first_name} ${formData.legal_last_name}?
        4. Is the document type appropriate for Irish work authorization?
        
        Respond in JSON format with:
        {
          "is_valid_document": true/false,
          "document_type": "description of what type of document this appears to be",
          "name_on_document": "name as it appears on the document",
          "name_matches": true/false,
          "expiry_date": "date if visible or null",
          "is_expired": true/false,
          "verification_notes": "brief explanation"
        }`,
        file_urls: [documentUrl],
        response_json_schema: {
          type: "object",
          properties: {
            is_valid_document: { type: "boolean" },
            document_type: { type: "string" },
            name_on_document: { type: "string" },
            name_matches: { type: "boolean" },
            expiry_date: { type: "string" },
            is_expired: { type: "boolean" },
            verification_notes: { type: "string" }
          }
        }
      });

      if (!result.is_valid_document) {
        toast.error('Document does not appear to be a valid work authorization document. Please upload the correct document.');
        setVisaDocumentUrl('');
        setVisaDocumentVerified(false);
      } else if (result.is_expired) {
        toast.error('This document appears to be expired. Please upload a current, valid document.');
        setVisaDocumentUrl('');
        setVisaDocumentVerified(false);
      } else if (!result.name_matches) {
        toast.error(`Name mismatch: Document shows "${result.name_on_document}" but you entered "${formData.legal_first_name} ${formData.legal_last_name}"`);
        setVisaDocumentUrl('');
        setVisaDocumentVerified(false);
      } else {
        setVisaDocumentVerified(true);
        setFormData(prev => ({ ...prev, visa_document_url: documentUrl }));
        toast.success('Work authorization document verified!');
      }
    } catch (error) {
      toast.error('Failed to verify document. Please try again.');
      setVisaDocumentUrl('');
      setVisaDocumentVerified(false);
    } finally {
      setVerifyingVisa(false);
    }
  };

  const verifyIdentity = async (documentUrl) => {
    setVerifyingIdentity(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an identity verification system. Analyze this ID document (passport or driving license) and extract the following information in JSON format:
        
        {
          "document_type": "passport" or "driving_license",
          "first_name": "extracted first name",
          "last_name": "extracted last name",
          "date_of_birth": "DD/MM/YYYY",
          "document_number": "ID number",
          "is_valid": true/false (check if document appears authentic and not expired),
          "verification_notes": "any concerns or observations"
        }
        
        Important: Check that the document is clear, not blurry, and appears to be a real government-issued ID.`,
        file_urls: [documentUrl],
        response_json_schema: {
          type: "object",
          properties: {
            document_type: { type: "string" },
            first_name: { type: "string" },
            last_name: { type: "string" },
            date_of_birth: { type: "string" },
            document_number: { type: "string" },
            is_valid: { type: "boolean" },
            verification_notes: { type: "string" }
          }
        }
      });
      
      // Check if names match
      const firstNameMatch = result.first_name.toLowerCase() === formData.legal_first_name.toLowerCase();
      const lastNameMatch = result.last_name.toLowerCase() === formData.legal_last_name.toLowerCase();
      
      if (result.is_valid && firstNameMatch && lastNameMatch) {
        setFormData(prev => ({ ...prev, identity_verified: true }));
        toast.success('Identity verified successfully!');
      } else if (!result.is_valid) {
        toast.error('Document appears invalid or unclear. Please upload a clear photo of a valid ID.');
        setFormData(prev => ({ ...prev, identity_document_url: '', identity_verified: false }));
      } else {
        toast.error(`Name mismatch: Document shows "${result.first_name} ${result.last_name}" but you entered "${formData.legal_first_name} ${formData.legal_last_name}"`);
        setFormData(prev => ({ ...prev, identity_document_url: '', identity_verified: false }));
      }
    } catch (error) {
      toast.error('Failed to verify document. Please try again.');
      setFormData(prev => ({ ...prev, identity_document_url: '', identity_verified: false }));
    } finally {
      setVerifyingIdentity(false);
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
      
      const updateData = {
        ...formData,
        weekly_hours_limit: weeklyLimit,
        onboarding_completed: true
      };
      
      await base44.auth.updateMe(updateData);
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

  // When visa doc required, step 4 is the new visa doc step, and 5-9 are old 4-8
  const getLogicalStep = (s) => {
    if (!requiresVisaDoc(formData.visa_status)) return s;
    if (s <= 3) return s;
    if (s === 4) return 'visa_doc';
    return s - 1; // logical step is physical step - 1
  };

  const canProceed = () => {
    const logical = getLogicalStep(step);
    switch (logical) {
      case 0: return true;
      case 1: return formData.legal_first_name && formData.legal_last_name && formData.pps_number;
      case 2: return formData.identity_verified;
      case 3: return formData.worker_type && formData.visa_status;
      case 'visa_doc': return visaDocumentVerified;
      case 4: return formData.location && formData.phone && formData.experience_years >= 0;
      case 5:
        if (formData.worker_type === 'both') {
          return formData.barista_skills.length > 0 && formData.chef_skills.length > 0;
        }
        return formData.worker_type === 'chef' 
          ? formData.chef_skills.length > 0 
          : formData.barista_skills.length > 0;
      case 6: return formData.availability.length > 0 && formData.preferred_shift_times.length > 0;
      case 7: return formData.desired_hourly_rate_min && formData.desired_hourly_rate_max;
      case 8: return formData.bio;
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
          {/* Step 0: Welcome & Mission */}
          {step === 0 && (
            <div className="space-y-8 text-center">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--terracotta)' }}>
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <div>
                <h2 className="text-4xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  Welcome to Hospo
                </h2>
                <p className="text-xl mb-6" style={{ color: 'var(--clay)' }}>
                  Ireland's Premier Hospitality Marketplace
                </p>
              </div>

              <div className="text-left max-w-xl mx-auto space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--sand)' }}>
                    <Coffee className="w-6 h-6" style={{ color: 'var(--terracotta)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-normal mb-1" style={{ color: 'var(--earth)' }}>Find Your Next Shift</h3>
                    <p className="text-sm" style={{ color: 'var(--clay)' }}>
                      Connect with top cafés and restaurants across Ireland. Browse shifts that match your skills and schedule.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--sand)' }}>
                    <DollarSign className="w-6 h-6" style={{ color: 'var(--sage)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-normal mb-1" style={{ color: 'var(--earth)' }}>Fair Pay, Guaranteed</h3>
                    <p className="text-sm" style={{ color: 'var(--clay)' }}>
                      Transparent rates, secure payments, and opportunities to grow your hospitality career.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--sand)' }}>
                    <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--olive)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-normal mb-1" style={{ color: 'var(--earth)' }}>Build Your Reputation</h3>
                    <p className="text-sm" style={{ color: 'var(--clay)' }}>
                      Earn reviews, showcase your skills, and unlock better opportunities with every shift.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm italic" style={{ color: 'var(--clay)' }}>
                Let's get you set up in just a few quick steps.
              </p>
            </div>
          )}

          {/* Step 1: Legal Identity & PPS */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Legal Information
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--clay)' }}>
                We need your legal name and PPS number to verify work authorization
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>
                    Legal First Name *
                  </label>
                  <Input
                    value={formData.legal_first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, legal_first_name: e.target.value }))}
                    placeholder="As appears on ID"
                    className="rounded-xl border h-12"
                    style={{ borderColor: 'var(--sand)' }}
                  />
                </div>

                <div>
                  <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>
                    Legal Last Name *
                  </label>
                  <Input
                    value={formData.legal_last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, legal_last_name: e.target.value }))}
                    placeholder="As appears on ID"
                    className="rounded-xl border h-12"
                    style={{ borderColor: 'var(--sand)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-normal mb-2 block flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                  <Shield className="w-4 h-4" />
                  PPS Number *
                </label>
                <Input
                  value={formData.pps_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, pps_number: e.target.value.toUpperCase() }))}
                  placeholder="1234567XX"
                  className="rounded-xl border h-12"
                  style={{ borderColor: 'var(--sand)' }}
                  maxLength={9}
                />
                <p className="text-xs mt-2" style={{ color: 'var(--clay)' }}>
                  Your PPS number is required to confirm work authorization in Ireland
                </p>
              </div>


            </div>
          )}

          {/* Step 2: Identity Verification */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Verify Your Identity
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--clay)' }}>
                Upload a clear photo of your passport or driving license to verify your identity
              </p>

              <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
                <div className="flex items-start gap-3 mb-4">
                  <Shield className="w-5 h-5 mt-1" style={{ color: 'var(--terracotta)' }} />
                  <div>
                    <h3 className="font-normal mb-1" style={{ color: 'var(--earth)' }}>Why we need this</h3>
                    <p className="text-sm" style={{ color: 'var(--clay)' }}>
                      Identity verification ensures a safe and trusted marketplace for both workers and employers.
                    </p>
                  </div>
                </div>
                <ul className="text-sm space-y-1 ml-8" style={{ color: 'var(--clay)' }}>
                  <li>• Make sure your document is valid and not expired</li>
                  <li>• Take a clear, well-lit photo</li>
                  <li>• Ensure all text is readable</li>
                  <li>• Names must match what you entered</li>
                </ul>
              </div>

              {!formData.identity_verified ? (
                <div>
                  <label className="text-sm font-normal mb-3 block" style={{ color: 'var(--clay)' }}>
                    Upload Passport or Driving License *
                  </label>
                  {formData.identity_document_url && !formData.identity_verified ? (
                    <div className="space-y-3">
                      <img 
                        src={formData.identity_document_url} 
                        alt="ID Document" 
                        className="w-full max-h-64 object-contain rounded-xl border-2"
                        style={{ borderColor: 'var(--sand)' }}
                      />
                      {verifyingIdentity && (
                        <div className="flex items-center gap-2 p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                          <div className="animate-spin rounded-full h-5 w-5 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
                          <span className="text-sm" style={{ color: 'var(--clay)' }}>Verifying your identity...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleIdentityUpload} 
                        className="hidden" 
                        disabled={uploadingIdentity || verifyingIdentity}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl w-full h-32 border-2 border-dashed"
                        style={{ borderColor: 'var(--sand)' }}
                        disabled={uploadingIdentity || verifyingIdentity}
                        onClick={(e) => e.currentTarget.previousElementSibling.click()}
                      >
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--clay)' }} />
                          <span className="text-sm" style={{ color: 'var(--clay)' }}>
                            {uploadingIdentity ? 'Uploading...' : 'Click to upload ID document'}
                          </span>
                        </div>
                      </Button>
                    </label>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-xl flex items-center gap-3" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
                  <CheckCircle2 className="w-8 h-8" />
                  <div>
                    <h3 className="font-normal text-lg mb-1">Identity Verified</h3>
                    <p className="text-sm opacity-90">
                      Your identity has been successfully verified
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Role & Visa */}
          {step === 3 && (
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

          {/* Visa Document Step (only for non-Irish/EU) */}
          {step === 4 && requiresVisaDoc(formData.visa_status) && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Upload Work Authorization Document
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--clay)' }}>
                Since you are not an Irish or EU citizen, you must upload a valid document proving your right to work in Ireland (IRP card, GNIB card, work permit, etc.)
              </p>

              <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: 'var(--terracotta)' }} />
                  <div>
                    <h3 className="font-normal mb-1" style={{ color: 'var(--earth)' }}>Accepted documents</h3>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--clay)' }}>
                      <li>• IRP card (Irish Residence Permit)</li>
                      <li>• GNIB card</li>
                      <li>• Work permit / Employment Permit</li>
                      <li>• Stamp visa page in passport</li>
                    </ul>
                  </div>
                </div>
              </div>

              {!visaDocumentVerified ? (
                <div>
                  {visaDocumentUrl && !visaDocumentVerified ? (
                    <div className="space-y-3">
                      <img
                        src={visaDocumentUrl}
                        alt="Visa document"
                        className="w-full max-h-64 object-contain rounded-xl border-2"
                        style={{ borderColor: 'var(--sand)' }}
                      />
                      {verifyingVisa && (
                        <div className="flex items-center gap-2 p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                          <div className="animate-spin rounded-full h-5 w-5 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
                          <span className="text-sm" style={{ color: 'var(--clay)' }}>Verifying your document with AI...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleVisaDocUpload}
                        className="hidden"
                        disabled={uploadingVisaDoc || verifyingVisa}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl w-full h-32 border-2 border-dashed"
                        style={{ borderColor: 'var(--sand)' }}
                        disabled={uploadingVisaDoc || verifyingVisa}
                        onClick={(e) => e.currentTarget.previousElementSibling.click()}
                      >
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--clay)' }} />
                          <span className="text-sm" style={{ color: 'var(--clay)' }}>
                            {uploadingVisaDoc ? 'Uploading...' : 'Click to upload work authorization document'}
                          </span>
                        </div>
                      </Button>
                    </label>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-xl flex items-center gap-3" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
                  <CheckCircle2 className="w-8 h-8" />
                  <div>
                    <h3 className="font-normal text-lg mb-1">Work Authorization Verified</h3>
                    <p className="text-sm opacity-90">Your document has been successfully verified by our AI system</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4 (non-visa) or Step 5 (visa): Basic Info */}
          {step === 4 && !requiresVisaDoc(formData.visa_status) && (
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

          {/* Step 5 (non-visa) or Step 6 (visa): Basic Info */}
          {step === 5 && requiresVisaDoc(formData.visa_status) && (
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
                    <Button type="button" variant="outline" className="rounded-xl" disabled={uploadingPic} onClick={(e) => e.currentTarget.previousElementSibling.click()}>
                      <Camera className="w-4 h-4 mr-2" />
                      {uploadingPic ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-normal mb-2 block flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                    <MapPin className="w-4 h-4" /> Location *
                  </label>
                  <Input value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} placeholder="Dublin, Ireland" className="rounded-xl border h-12" style={{ borderColor: 'var(--sand)' }} />
                </div>
                <div>
                  <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>Phone Number *</label>
                  <Input value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+353..." className="rounded-xl border h-12" style={{ borderColor: 'var(--sand)' }} />
                </div>
              </div>
              <div>
                <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>Years of Experience *</label>
                <Input type="number" min="0" value={formData.experience_years} onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) }))} className="rounded-xl border h-12" style={{ borderColor: 'var(--sand)' }} />
              </div>
            </div>
          )}

          {/* Skills */}
          {step === 5 && !requiresVisaDoc(formData.visa_status) && (
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

          {/* Step 6: Availability */}
          {step === 6 && (
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

          {/* Step 7: Desired Rates */}
          {step === 7 && (
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

          {/* Step 8: About & CV */}
          {step === 8 && (
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
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="rounded-xl font-normal"
              style={{ borderColor: 'var(--sand)', color: 'var(--clay)' }}
            >
              Back
            </Button>
          )}
          {step < totalSteps - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 rounded-xl font-normal"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
            >
              {step === 0 ? "Let's Get Started" : 'Continue'}
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