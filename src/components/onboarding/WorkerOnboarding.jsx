import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "../mobile/MobileSelect";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, CheckCircle2, Coffee, ChefHat, Shield, MapPin, Clock, DollarSign, Sparkles, X, FileText, Building } from "lucide-react";
import { toast } from "sonner";
import HospoLogo from "../HospoLogo";

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

const requiresVisaDoc = (status) => !['irish_citizen', 'eu_citizen', ''].includes(status);

// Build dynamic step list based on visa status
function getSteps(visaStatus) {
  const base = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'legal', label: 'Identity' },
    { id: 'id_verify', label: 'Verify ID' },
    { id: 'role_visa', label: 'Role & Visa' },
  ];
  if (requiresVisaDoc(visaStatus)) {
    base.push({ id: 'visa_doc', label: 'Work Auth' });
  }
  base.push(
    { id: 'basic_info', label: 'Basic Info' },
    { id: 'skills', label: 'Skills' },
    { id: 'availability', label: 'Availability' },
    { id: 'rates', label: 'Rates' },
    { id: 'banking', label: 'Banking' },
    { id: 'about', label: 'About' },
  );
  return base;
}

export default function WorkerOnboarding({ user, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
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
    desired_hourly_rate_max: '',
    iban: '',
    bic: '',
    bank_holder_name: '',
    bank_name: ''
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

  const steps = getSteps(formData.visa_status);
  const totalSteps = steps.length - 1;
  const currentStepId = steps[stepIndex]?.id;

  // When visa status changes, rebuild steps and clamp index
  const handleVisaChange = (value) => {
    setFormData(prev => ({ ...prev, visa_status: value }));
    // If we're past the visa_doc step slot and visa is removed, clamp
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPic(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_picture_url: file_url }));
      toast.success('Profile picture uploaded!');
    } catch { toast.error('Failed to upload image'); }
    finally { setUploadingPic(false); }
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCV(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, resume_url: file_url }));
      toast.success('CV uploaded!');
    } catch { toast.error('Failed to upload CV'); }
    finally { setUploadingCV(false); }
  };

  const handleIdentityUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingIdentity(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, identity_document_url: file_url }));
      toast.success('Document uploaded! Now verifying...');
      await verifyIdentity(file_url);
    } catch { toast.error('Failed to upload document'); }
    finally { setUploadingIdentity(false); }
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
    } catch { toast.error('Failed to upload document'); }
    finally { setUploadingVisaDoc(false); }
  };

  const verifyVisaDocument = async (documentUrl) => {
    setVerifyingVisa(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an Irish immigration document verification system. Analyze this document image and determine if it is a valid Irish work authorization document (IRP card, GNIB card, stamp, visa, work permit, or similar). Check: 1. Is this a genuine-looking official document? 2. Does it appear valid and not expired? 3. Does the name on the document match: ${formData.legal_first_name} ${formData.legal_last_name}? 4. Is the document type appropriate for Irish work authorization?`,
        file_urls: [documentUrl],
        response_json_schema: {
          type: "object",
          properties: {
            is_valid_document: { type: "boolean" },
            document_type: { type: "string" },
            name_on_document: { type: "string" },
            name_matches: { type: "boolean" },
            is_expired: { type: "boolean" },
            verification_notes: { type: "string" }
          }
        }
      });
      if (!result.is_valid_document) {
        toast.error('Document does not appear to be a valid work authorization document.');
        setVisaDocumentUrl(''); setVisaDocumentVerified(false);
      } else if (result.is_expired) {
        toast.error('This document appears to be expired. Please upload a current, valid document.');
        setVisaDocumentUrl(''); setVisaDocumentVerified(false);
      } else if (!result.name_matches) {
        toast.error(`Name mismatch: Document shows "${result.name_on_document}" but you entered "${formData.legal_first_name} ${formData.legal_last_name}"`);
        setVisaDocumentUrl(''); setVisaDocumentVerified(false);
      } else {
        setVisaDocumentVerified(true);
        setFormData(prev => ({ ...prev, visa_document_url: documentUrl }));
        toast.success('Work authorization document verified!');
      }
    } catch {
      toast.error('Failed to verify document. Please try again.');
      setVisaDocumentUrl(''); setVisaDocumentVerified(false);
    } finally { setVerifyingVisa(false); }
  };

  const verifyIdentity = async (documentUrl) => {
    setVerifyingIdentity(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an identity verification system. Analyze this ID document (passport or driving license) and extract information. Check that the document is clear and appears to be a real government-issued ID.`,
        file_urls: [documentUrl],
        response_json_schema: {
          type: "object",
          properties: {
            first_name: { type: "string" },
            last_name: { type: "string" },
            is_valid: { type: "boolean" },
            verification_notes: { type: "string" }
          }
        }
      });
      const firstNameMatch = result.first_name?.toLowerCase() === formData.legal_first_name.toLowerCase();
      const lastNameMatch = result.last_name?.toLowerCase() === formData.legal_last_name.toLowerCase();
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
    } catch {
      toast.error('Failed to verify document. Please try again.');
      setFormData(prev => ({ ...prev, identity_document_url: '', identity_verified: false }));
    } finally { setVerifyingIdentity(false); }
  };

  const generateSummary = async () => {
    setGeneratingAI(true);
    try {
      const skills = formData.worker_type === 'chef' ? formData.chef_skills :
        formData.worker_type === 'both' ? [...formData.barista_skills, ...formData.chef_skills] :
        formData.barista_skills;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional summary for a ${formData.worker_type} with ${formData.experience_years} years of experience in Irish hospitality. Skills: ${skills.join(', ')}. Location: ${formData.location}. Make it 2-3 sentences, professional but warm. Don't use clichés.`,
      });
      setFormData(prev => ({ ...prev, professional_summary: result }));
      toast.success('Professional summary generated!');
    } catch { toast.error('Failed to generate summary'); }
    finally { setGeneratingAI(false); }
  };

  const completeMutation = useMutation({
    mutationFn: async () => {
      const weeklyLimit = visaHoursLimits[formData.visa_status];
      await base44.auth.updateMe({ ...formData, weekly_hours_limit: weeklyLimit, onboarding_completed: true });
    },
    onSuccess: () => { toast.success('Profile setup complete!'); onComplete(); }
  });

  const toggleSkill = (skill, type) => {
    const key = type === 'barista' ? 'barista_skills' : 'chef_skills';
    setFormData(prev => ({ ...prev, [key]: prev[key].includes(skill) ? prev[key].filter(s => s !== skill) : [...prev[key], skill] }));
  };

  const toggleDay = (day) => {
    setFormData(prev => ({ ...prev, availability: prev.availability.includes(day) ? prev.availability.filter(d => d !== day) : [...prev.availability, day] }));
  };

  const toggleShiftTime = (time) => {
    setFormData(prev => ({ ...prev, preferred_shift_times: prev.preferred_shift_times.includes(time) ? prev.preferred_shift_times.filter(t => t !== time) : [...prev.preferred_shift_times, time] }));
  };

  const canProceed = () => {
    switch (currentStepId) {
      case 'welcome': return true;
      case 'legal': return formData.legal_first_name && formData.legal_last_name && formData.pps_number;
      case 'id_verify': return formData.identity_verified;
      case 'role_visa': return formData.worker_type && formData.visa_status;
      case 'visa_doc': return visaDocumentVerified;
      case 'basic_info': return formData.location && formData.phone && formData.experience_years >= 0;
      case 'skills':
        if (formData.worker_type === 'both') return formData.barista_skills.length > 0 && formData.chef_skills.length > 0;
        return formData.worker_type === 'chef' ? formData.chef_skills.length > 0 : formData.barista_skills.length > 0;
      case 'availability': return formData.availability.length > 0 && formData.preferred_shift_times.length > 0;
      case 'rates': return formData.desired_hourly_rate_min && formData.desired_hourly_rate_max;
      case 'banking': return formData.iban && formData.bank_holder_name;
      case 'about': return formData.bio;
      default: return true;
    }
  };

  const goNext = () => {
    if (stepIndex < totalSteps) setStepIndex(i => i + 1);
  };
  const goBack = () => {
    if (stepIndex > 0) setStepIndex(i => i - 1);
  };

  // Step label names for progress indicator (short)
  const progressSteps = steps.map(s => s.label);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-2xl w-full rounded-2xl p-8 my-8" style={{ backgroundColor: 'var(--warm-white)' }}>

        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-6">
          <HospoLogo size="md" />
          {stepIndex > 0 && (
            <span className="text-xs tracking-widest font-light" style={{ color: 'var(--clay)' }}>
              STEP {stepIndex} OF {totalSteps}
            </span>
          )}
        </div>

        {/* Progress Dots */}
        {stepIndex > 0 && (
          <div className="mb-8">
            {/* Bar */}
            <div className="h-1.5 rounded-full mb-3" style={{ backgroundColor: 'var(--sand)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ backgroundColor: 'var(--terracotta)', width: `${(stepIndex / totalSteps) * 100}%` }}
              />
            </div>
            {/* Dot indicators */}
            <div className="flex items-center gap-1 flex-wrap">
              {steps.slice(1).map((s, i) => {
                const dotIndex = i + 1;
                const isDone = stepIndex > dotIndex;
                const isCurrent = stepIndex === dotIndex;
                return (
                  <div key={s.id} className="flex items-center gap-1">
                    <div
                      className="flex items-center justify-center rounded-full transition-all duration-300"
                      style={{
                        width: isCurrent ? 28 : 20,
                        height: isCurrent ? 28 : 20,
                        backgroundColor: isDone ? 'var(--sage)' : isCurrent ? 'var(--terracotta)' : 'var(--sand)',
                        flexShrink: 0
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      ) : (
                        <span className="text-xs font-normal" style={{ color: isCurrent ? 'white' : 'var(--clay)', fontSize: 10 }}>{dotIndex}</span>
                      )}
                    </div>
                    {isCurrent && (
                      <span className="text-xs font-normal" style={{ color: 'var(--terracotta)' }}>{s.label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="mb-8 min-h-[380px]">

          {/* Welcome */}
          {currentStepId === 'welcome' && (
            <div className="space-y-8 text-center">
              <div className="flex justify-center">
                <HospoLogo size="xl" />
              </div>
              <div>
                <h2 className="text-4xl font-light mb-3" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  Welcome to Hospo
                </h2>
                <p className="text-xl" style={{ color: 'var(--clay)' }}>Ireland's Premier Hospitality Marketplace</p>
              </div>
              <div className="text-left max-w-xl mx-auto space-y-5">
                {[
                  { icon: Coffee, color: 'var(--terracotta)', title: 'Find Your Next Shift', desc: 'Connect with top cafés and restaurants across Ireland.' },
                  { icon: DollarSign, color: 'var(--sage)', title: 'Fair Pay, Guaranteed', desc: 'Transparent rates, secure payments, and opportunities to grow.' },
                  { icon: CheckCircle2, color: 'var(--olive)', title: 'Build Your Reputation', desc: 'Earn reviews and unlock better opportunities with every shift.' },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="flex gap-4 items-start">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--sand)' }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="font-normal mb-1" style={{ color: 'var(--earth)' }}>{title}</h3>
                      <p className="text-sm" style={{ color: 'var(--clay)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm italic" style={{ color: 'var(--clay)' }}>Let's get you set up in just a few quick steps.</p>
            </div>
          )}

          {/* Legal Info */}
          {currentStepId === 'legal' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Legal Information</h2>
                <p className="text-sm" style={{ color: 'var(--clay)' }}>We need your legal name and PPS number to verify work authorization</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>Legal First Name *</label>
                  <Input value={formData.legal_first_name} onChange={(e) => setFormData(prev => ({ ...prev, legal_first_name: e.target.value }))} placeholder="As appears on ID" className="rounded-xl border h-12" style={{ borderColor: 'var(--sand)' }} />
                </div>
                <div>
                  <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>Legal Last Name *</label>
                  <Input value={formData.legal_last_name} onChange={(e) => setFormData(prev => ({ ...prev, legal_last_name: e.target.value }))} placeholder="As appears on ID" className="rounded-xl border h-12" style={{ borderColor: 'var(--sand)' }} />
                </div>
              </div>
              <div>
                <label className="text-sm font-normal mb-2 block flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                  <Shield className="w-4 h-4" /> PPS Number *
                </label>
                <Input value={formData.pps_number} onChange={(e) => setFormData(prev => ({ ...prev, pps_number: e.target.value.toUpperCase() }))} placeholder="1234567XX" className="rounded-xl border h-12" style={{ borderColor: 'var(--sand)' }} maxLength={9} />
                <p className="text-xs mt-2" style={{ color: 'var(--clay)' }}>Required to confirm work authorization in Ireland</p>
              </div>
            </div>
          )}

          {/* ID Verify */}
          {currentStepId === 'id_verify' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Verify Your Identity</h2>
                <p className="text-sm" style={{ color: 'var(--clay)' }}>Upload a clear photo of your passport or driving license</p>
              </div>
              <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--terracotta)' }} />
                  <ul className="text-sm space-y-1" style={{ color: 'var(--clay)' }}>
                    <li>• Make sure your document is valid and not expired</li>
                    <li>• Take a clear, well-lit photo</li>
                    <li>• Names must match what you entered</li>
                  </ul>
                </div>
              </div>
              {formData.identity_verified ? (
                <div className="p-6 rounded-xl flex items-center gap-3" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
                  <CheckCircle2 className="w-8 h-8" />
                  <div>
                    <h3 className="font-normal text-lg mb-1">Identity Verified</h3>
                    <p className="text-sm opacity-90">Your identity has been successfully verified</p>
                  </div>
                </div>
              ) : (
                <div>
                  {(uploadingIdentity || verifyingIdentity) ? (
                    <div className="flex flex-col items-center gap-4 p-10 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                      <div className="animate-spin rounded-full h-10 w-10 border-4" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
                      <div className="text-center">
                        <p className="font-normal mb-1" style={{ color: 'var(--earth)' }}>
                          {uploadingIdentity ? 'Uploading document...' : 'Verifying your identity...'}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--clay)' }}>This can take up to 30 seconds, please don't close or refresh the page</p>
                      </div>
                    </div>
                  ) : formData.identity_document_url && !formData.identity_verified ? (
                    <div className="space-y-3">
                      <img src={formData.identity_document_url} alt="ID Document" className="w-full max-h-64 object-contain rounded-xl border-2" style={{ borderColor: 'var(--sand)' }} />
                    </div>
                  ) : !formData.identity_verified ? (
                    <label>
                      <input type="file" accept="image/*" onChange={handleIdentityUpload} className="hidden" disabled={uploadingIdentity || verifyingIdentity} />
                      <Button type="button" variant="outline" className="rounded-xl w-full h-32 border-2 border-dashed" style={{ borderColor: 'var(--sand)' }} disabled={uploadingIdentity || verifyingIdentity} onClick={(e) => e.currentTarget.previousElementSibling.click()}>
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--clay)' }} />
                          <span className="text-sm" style={{ color: 'var(--clay)' }}>Click to upload ID document</span>
                        </div>
                      </Button>
                    </label>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Role & Visa */}
          {currentStepId === 'role_visa' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Role & Work Authorization</h2>
                <p className="text-sm" style={{ color: 'var(--clay)' }}>Tell us what type of worker you are and your immigration status</p>
              </div>
              <div>
                <label className="text-sm font-normal mb-3 block" style={{ color: 'var(--clay)' }}>Worker Type *</label>
                <div className="flex flex-wrap gap-3">
                  {['barista', 'chef', 'both'].map(type => (
                    <button key={type} onClick={() => setFormData(prev => ({ ...prev, worker_type: type }))}
                      className="flex items-center gap-2 px-6 py-4 rounded-xl transition-all font-normal"
                      style={formData.worker_type === type ? { backgroundColor: type === 'chef' ? 'var(--sage)' : 'var(--terracotta)', color: 'white', border: 'none' } : { backgroundColor: 'transparent', border: '2px solid var(--sand)', color: 'var(--clay)' }}>
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
                  <Shield className="w-4 h-4" /> Work Authorization Status *
                </label>
                <MobileSelect value={formData.visa_status} onValueChange={handleVisaChange}>
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
                {formData.visa_status && !requiresVisaDoc(formData.visa_status) && (
                  <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--sage)' }}>
                    <CheckCircle2 className="w-3 h-3" /> No additional documents required
                  </p>
                )}
                {requiresVisaDoc(formData.visa_status) && (
                  <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--terracotta)' }}>
                    <Shield className="w-3 h-3" /> You'll need to upload your work authorization document next
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Visa Document (conditional) */}
          {currentStepId === 'visa_doc' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Work Authorization Document</h2>
                <p className="text-sm" style={{ color: 'var(--clay)' }}>Upload a valid document proving your right to work in Ireland</p>
              </div>
              <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--terracotta)' }} />
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
              {visaDocumentVerified ? (
                <div className="p-6 rounded-xl flex items-center gap-3" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
                  <CheckCircle2 className="w-8 h-8" />
                  <div>
                    <h3 className="font-normal text-lg mb-1">Work Authorization Verified</h3>
                    <p className="text-sm opacity-90">Your document has been successfully verified</p>
                  </div>
                </div>
              ) : (
                <div>
                  {(uploadingVisaDoc || verifyingVisa) ? (
                    <div className="flex flex-col items-center gap-4 p-10 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                      <div className="animate-spin rounded-full h-10 w-10 border-4" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
                      <div className="text-center">
                        <p className="font-normal mb-1" style={{ color: 'var(--earth)' }}>
                          {uploadingVisaDoc ? 'Uploading document...' : 'Verifying work authorization...'}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--clay)' }}>This can take up to 30 seconds, please don't close or refresh the page</p>
                      </div>
                    </div>
                  ) : !visaDocumentVerified ? (
                    <label>
                      <input type="file" accept="image/*,.pdf" onChange={handleVisaDocUpload} className="hidden" disabled={uploadingVisaDoc || verifyingVisa} />
                      <Button type="button" variant="outline" className="rounded-xl w-full h-32 border-2 border-dashed" style={{ borderColor: 'var(--sand)' }} disabled={uploadingVisaDoc || verifyingVisa} onClick={(e) => e.currentTarget.previousElementSibling.click()}>
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--clay)' }} />
                          <span className="text-sm" style={{ color: 'var(--clay)' }}>Click to upload work authorization document</span>
                        </div>
                      </Button>
                    </label>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Basic Info */}
          {currentStepId === 'basic_info' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Basic Information</h2>
              <div>
                <label className="text-sm font-normal mb-3 block" style={{ color: 'var(--clay)' }}>Profile Picture (Optional)</label>
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
                      <Camera className="w-4 h-4 mr-2" /> {uploadingPic ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                  </label>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-normal mb-2 block flex items-center gap-2" style={{ color: 'var(--clay)' }}><MapPin className="w-4 h-4" /> Location *</label>
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
          {currentStepId === 'skills' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Your Skills</h2>
                <p className="text-sm" style={{ color: 'var(--clay)' }}>Select all skills that apply to you</p>
              </div>
              {(formData.worker_type === 'barista' || formData.worker_type === 'both') && (
                <div>
                  <label className="text-sm font-normal mb-3 block flex items-center gap-2" style={{ color: 'var(--clay)' }}><Coffee className="w-4 h-4" /> Barista Skills *</label>
                  <div className="flex flex-wrap gap-2">
                    {baristaSkillOptions.map(skill => (
                      <Badge key={skill} className="cursor-pointer transition-all hover-lift rounded-xl px-4 py-2"
                        style={formData.barista_skills.includes(skill) ? { backgroundColor: 'var(--terracotta)', color: 'white' } : { backgroundColor: 'transparent', border: '2px solid var(--sand)', color: 'var(--clay)' }}
                        onClick={() => toggleSkill(skill, 'barista')}>
                        {skill.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(formData.worker_type === 'chef' || formData.worker_type === 'both') && (
                <div>
                  <label className="text-sm font-normal mb-3 block flex items-center gap-2" style={{ color: 'var(--clay)' }}><ChefHat className="w-4 h-4" /> Chef Skills *</label>
                  <div className="flex flex-wrap gap-2">
                    {chefSkillOptions.map(skill => (
                      <Badge key={skill} className="cursor-pointer transition-all hover-lift rounded-xl px-4 py-2"
                        style={formData.chef_skills.includes(skill) ? { backgroundColor: 'var(--sage)', color: 'white' } : { backgroundColor: 'transparent', border: '2px solid var(--sand)', color: 'var(--clay)' }}
                        onClick={() => toggleSkill(skill, 'chef')}>
                        {skill.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Availability */}
          {currentStepId === 'availability' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Your Availability</h2>
              <div>
                <label className="text-sm font-normal mb-3 block flex items-center gap-2" style={{ color: 'var(--clay)' }}><Clock className="w-4 h-4" /> Available Days *</label>
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map(day => (
                    <Badge key={day} className="cursor-pointer transition-all hover-lift rounded-xl px-4 py-2"
                      style={formData.availability.includes(day) ? { backgroundColor: 'var(--sage)', color: 'white' } : { backgroundColor: 'transparent', border: '2px solid var(--sand)', color: 'var(--clay)' }}
                      onClick={() => toggleDay(day)}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-normal mb-3 block" style={{ color: 'var(--clay)' }}>Preferred Shift Times *</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'early_morning', label: 'Early Morning (5am-9am)' },
                    { value: 'morning', label: 'Morning (9am-12pm)' },
                    { value: 'afternoon', label: 'Afternoon (12pm-5pm)' },
                    { value: 'evening', label: 'Evening (5pm-10pm)' },
                    { value: 'late_night', label: 'Late Night (10pm+)' }
                  ].map(time => (
                    <Badge key={time.value} className="cursor-pointer transition-all hover-lift rounded-xl px-4 py-2"
                      style={formData.preferred_shift_times.includes(time.value) ? { backgroundColor: 'var(--olive)', color: 'white' } : { backgroundColor: 'transparent', border: '2px solid var(--sand)', color: 'var(--clay)' }}
                      onClick={() => toggleShiftTime(time.value)}>
                      {time.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rates */}
          {currentStepId === 'rates' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Your Desired Hourly Rate</h2>
                <p className="text-sm" style={{ color: 'var(--clay)' }}>This helps employers understand your expectations</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-normal mb-2 block flex items-center gap-2" style={{ color: 'var(--clay)' }}><DollarSign className="w-4 h-4" /> Minimum Rate *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-normal" style={{ color: 'var(--clay)' }}>€</span>
                    <Input type="number" min="0" step="0.50" value={formData.desired_hourly_rate_min} onChange={(e) => setFormData(prev => ({ ...prev, desired_hourly_rate_min: parseFloat(e.target.value) }))} placeholder="12.00" className="rounded-xl border h-12 pl-8" style={{ borderColor: 'var(--sand)' }} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>Maximum Rate *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-normal" style={{ color: 'var(--clay)' }}>€</span>
                    <Input type="number" min="0" step="0.50" value={formData.desired_hourly_rate_max} onChange={(e) => setFormData(prev => ({ ...prev, desired_hourly_rate_max: parseFloat(e.target.value) }))} placeholder="18.00" className="rounded-xl border h-12 pl-8" style={{ borderColor: 'var(--sand)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banking / Payment Details */}
          {currentStepId === 'banking' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Payment Details</h2>
                <p className="text-sm" style={{ color: 'var(--clay)' }}>Your bank details are required to receive payment for shifts</p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
                <Building className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--terracotta)' }} />
                <div className="text-sm" style={{ color: 'var(--clay)' }}>
                  <p className="font-normal mb-1" style={{ color: 'var(--earth)' }}>Secure & mandatory</p>
                  <p>Employers pay through Hospo, and your earnings are transferred directly to this account within 3–5 business days. We take a 10% platform fee from the employer — you receive the full agreed rate.</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>Account Holder Name *</label>
                <Input
                  value={formData.bank_holder_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, bank_holder_name: e.target.value }))}
                  placeholder="As it appears on your bank account"
                  className="rounded-xl border h-12"
                  style={{ borderColor: 'var(--sand)' }}
                />
              </div>
              <div>
                <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>IBAN *</label>
                <Input
                  value={formData.iban}
                  onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value.replace(/\s/g, '').toUpperCase() }))}
                  placeholder="IE29 AIBK 9311 5212 3456 78"
                  className="rounded-xl border h-12 font-mono"
                  style={{ borderColor: 'var(--sand)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--clay)' }}>Irish IBANs start with IE and are 22 characters long</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>BIC / SWIFT (Optional)</label>
                  <Input
                    value={formData.bic}
                    onChange={(e) => setFormData(prev => ({ ...prev, bic: e.target.value.toUpperCase() }))}
                    placeholder="AIBKIE2D"
                    className="rounded-xl border h-12 font-mono"
                    style={{ borderColor: 'var(--sand)' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>Bank Name (Optional)</label>
                  <Input
                    value={formData.bank_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                    placeholder="AIB, Bank of Ireland..."
                    className="rounded-xl border h-12"
                    style={{ borderColor: 'var(--sand)' }}
                  />
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--clay)' }}>
                🔒 Your banking details are encrypted and stored securely. They are only used to transfer your shift earnings.
              </p>
            </div>
          )}

          {/* About */}
          {currentStepId === 'about' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Tell Us About Yourself</h2>
              <div>
                <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>About Me *</label>
                <Textarea value={formData.bio} onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell employers about your experience, passion for hospitality, and what makes you a great worker..." className="rounded-xl border" style={{ borderColor: 'var(--sand)' }} rows={4} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-normal" style={{ color: 'var(--clay)' }}>Professional Summary (Optional)</label>
                  <Button size="sm" variant="outline" onClick={generateSummary} disabled={generatingAI} className="rounded-xl text-xs" style={{ borderColor: 'var(--terracotta)', color: 'var(--terracotta)' }}>
                    <Sparkles className="w-3 h-3 mr-1" /> {generatingAI ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <Textarea value={formData.professional_summary} onChange={(e) => setFormData(prev => ({ ...prev, professional_summary: e.target.value }))} placeholder="A compelling professional summary..." className="rounded-xl border" style={{ borderColor: 'var(--sand)' }} rows={3} />
              </div>
              <div>
                <label className="text-sm font-normal mb-2 block" style={{ color: 'var(--clay)' }}>Upload CV/Resume (Optional)</label>
                {formData.resume_url ? (
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" style={{ color: 'var(--clay)' }} />
                      <span className="text-sm" style={{ color: 'var(--earth)' }}>CV uploaded</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setFormData(prev => ({ ...prev, resume_url: '' }))}><X className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <label>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleCVUpload} className="hidden" />
                    <Button type="button" variant="outline" className="rounded-xl w-full" disabled={uploadingCV} onClick={(e) => e.currentTarget.previousElementSibling.click()}>
                      <Upload className="w-4 h-4 mr-2" /> {uploadingCV ? 'Uploading...' : 'Upload CV'}
                    </Button>
                  </label>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {stepIndex > 0 && (
            <Button variant="outline" onClick={goBack} className="rounded-xl font-normal" style={{ borderColor: 'var(--sand)', color: 'var(--clay)' }}>
              Back
            </Button>
          )}
          {stepIndex < totalSteps ? (
            <Button onClick={goNext} disabled={!canProceed()} className="flex-1 rounded-xl font-normal" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
              {stepIndex === 0 ? "Let's Get Started" : 'Continue'}
            </Button>
          ) : (
            <Button onClick={() => completeMutation.mutate()} disabled={!canProceed() || completeMutation.isPending} className="flex-1 rounded-xl font-normal flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
              <CheckCircle2 className="w-5 h-5" />
              {completeMutation.isPending ? 'Completing...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}