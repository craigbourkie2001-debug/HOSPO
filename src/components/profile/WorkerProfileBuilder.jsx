import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User, Coffee, ChefHat, Clock, Upload, Camera, FileText,
  Sparkles, Plus, Trash2, X, CheckCircle2, Award, Briefcase,
  MapPin, Link, ChevronRight, ChevronLeft
} from "lucide-react";
import { toast } from "sonner";

const baristaSkillOptions = [
  "espresso", "latte_art", "filter", "pour_over", "cold_brew",
  "customer_service", "training", "opening", "closing", "cash_handling", "management", "mixology"
];

const chefSkillOptions = [
  "line_cook", "prep_cook", "grill", "saute", "pastry",
  "sous_chef", "head_chef", "food_safety", "inventory",
  "menu_planning", "plating", "butchery", "seafood", "vegetarian"
];

const dayOptions = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const shiftTimeOptions = [
  { value: "early_morning", label: "Early Morning (5am–9am)" },
  { value: "morning", label: "Morning (9am–12pm)" },
  { value: "afternoon", label: "Afternoon (12pm–5pm)" },
  { value: "evening", label: "Evening (5pm–10pm)" },
  { value: "late_night", label: "Late Night (10pm+)" },
];

const steps = [
  { id: "basics", label: "Basics", icon: User },
  { id: "skills", label: "Skills", icon: Coffee },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "availability", label: "Availability", icon: Clock },
  { id: "portfolio", label: "Portfolio", icon: Camera },
];

export default function WorkerProfileBuilder({ user, onSave, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [extractingCV, setExtractingCV] = useState(false);

  const [formData, setFormData] = useState({
    bio: user?.bio || "",
    professional_summary: user?.professional_summary || "",
    profile_picture_url: user?.profile_picture_url || "",
    resume_url: user?.resume_url || "",
    portfolio_link: user?.portfolio_link || "",
    location: user?.location || "",
    phone: user?.phone || "",
    worker_type: user?.worker_type || "barista",
    visa_status: user?.visa_status || "",
    experience_years: user?.experience_years || 0,
    barista_skills: user?.barista_skills || [],
    chef_skills: user?.chef_skills || [],
    certifications: user?.certifications || [],
    availability: user?.availability || [],
    preferred_shift_times: user?.preferred_shift_times || [],
    desired_hourly_rate_min: user?.desired_hourly_rate_min || "",
    desired_hourly_rate_max: user?.desired_hourly_rate_max || "",
    work_experience: user?.work_experience || [],
    skill_portfolio: user?.skill_portfolio || [],
  });

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleSkill = (skill, type) => {
    const key = type === "barista" ? "barista_skills" : "chef_skills";
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(skill)
        ? prev[key].filter(s => s !== skill)
        : [...prev[key], skill],
    }));
  };

  const toggleDay = (day) =>
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day],
    }));

  const toggleShiftTime = (val) =>
    setFormData(prev => ({
      ...prev,
      preferred_shift_times: prev.preferred_shift_times.includes(val)
        ? prev.preferred_shift_times.filter(t => t !== val)
        : [...prev.preferred_shift_times, val],
    }));

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPic(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("profile_picture_url", file_url);
    toast.success("Profile picture uploaded!");
    setUploadingPic(false);
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCV(true);
    setExtractingCV(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("resume_url", file_url);
    toast.success("CV uploaded!");
    try {
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
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
                  description: { type: "string" },
                },
              },
            },
          },
        },
      });
      if (result.status === "success" && result.output?.work_experience?.length) {
        setFormData(prev => ({ ...prev, work_experience: result.output.work_experience }));
        toast.success("Work experience auto-extracted from CV!");
      }
    } catch {}
    setUploadingCV(false);
    setExtractingCV(false);
  };

  const handlePortfolioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPortfolio(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({
      ...prev,
      skill_portfolio: [...prev.skill_portfolio, { title: "", description: "", image_url: file_url }],
    }));
    toast.success("Image added to portfolio!");
    setUploadingPortfolio(false);
  };

  const generateSummary = async () => {
    setGeneratingAI(true);
    const skills = formData.worker_type === "chef"
      ? formData.chef_skills
      : formData.worker_type === "both"
        ? [...formData.barista_skills, ...formData.chef_skills]
        : formData.barista_skills;
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional summary for a ${formData.worker_type} with ${formData.experience_years} years of experience in Irish hospitality. Skills: ${skills.join(", ")}. Location: ${formData.location}. Make it 2-3 sentences, professional but warm. Don't use clichés.`,
    });
    update("professional_summary", result);
    toast.success("Summary generated!");
    setGeneratingAI(false);
  };

  const addWorkExp = () =>
    setFormData(prev => ({
      ...prev,
      work_experience: [...prev.work_experience, { job_title: "", company: "", location: "", start_date: "", end_date: "", current: false, description: "" }],
    }));

  const removeWorkExp = (i) =>
    setFormData(prev => ({ ...prev, work_experience: prev.work_experience.filter((_, idx) => idx !== i) }));

  const updateWorkExp = (i, field, val) =>
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.map((e, idx) => idx === i ? { ...e, [field]: val } : e),
    }));

  const addCert = () =>
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: "", issuer: "", date_obtained: "" }],
    }));

  const removeCert = (i) =>
    setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }));

  const updateCert = (i, field, val) =>
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((c, idx) => idx === i ? { ...c, [field]: val } : c),
    }));

  const removePortfolio = (i) =>
    setFormData(prev => ({ ...prev, skill_portfolio: prev.skill_portfolio.filter((_, idx) => idx !== i) }));

  const updatePortfolio = (i, field, val) =>
    setFormData(prev => ({
      ...prev,
      skill_portfolio: prev.skill_portfolio.map((p, idx) => idx === i ? { ...p, [field]: val } : p),
    }));

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ ...formData, profile_builder_completed: true });
    toast.success("Profile saved!");
    setSaving(false);
    onSave?.();
  };

  const SkillBadge = ({ label, active, onClick, color = "terracotta" }) => (
    <Badge
      className="cursor-pointer transition-all hover-lift rounded-xl px-3 py-1.5 font-normal"
      style={active
        ? { backgroundColor: `var(--${color})`, color: "white", border: "none" }
        : { backgroundColor: "transparent", border: "1px solid var(--sand)", color: "var(--clay)" }
      }
      onClick={onClick}
    >
      {label}
      {active && <X className="w-3 h-3 ml-1" />}
    </Badge>
  );

  const stepContent = [
    // Step 0: Basics
    <div key="basics" className="space-y-6">
      <div>
        <h2 className="text-2xl font-light mb-1" style={{ fontFamily: "Crimson Pro, serif", color: "var(--earth)" }}>Basic Information</h2>
        <p className="text-sm" style={{ color: "var(--clay)" }}>Your profile starts here — add a photo, your location, and a short bio.</p>
      </div>

      {/* Profile Picture */}
      <div className="flex items-center gap-5">
        {formData.profile_picture_url ? (
          <img src={formData.profile_picture_url} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2" style={{ borderColor: "var(--sand)" }} />
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-light text-white" style={{ backgroundColor: "var(--terracotta)" }}>
            {user?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <label>
          <input type="file" accept="image/*" onChange={handlePicUpload} className="hidden" disabled={uploadingPic} />
          <Button type="button" variant="outline" className="rounded-xl" disabled={uploadingPic}
            onClick={(e) => e.currentTarget.previousElementSibling.click()}>
            <Camera className="w-4 h-4 mr-2" />
            {uploadingPic ? "Uploading..." : "Upload Photo"}
          </Button>
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs tracking-wider mb-2 block" style={{ color: "var(--clay)" }}>LOCATION</label>
          <Input value={formData.location} onChange={e => update("location", e.target.value)}
            placeholder="Dublin, Ireland" className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
        </div>
        <div>
          <label className="text-xs tracking-wider mb-2 block" style={{ color: "var(--clay)" }}>PHONE</label>
          <Input value={formData.phone} onChange={e => update("phone", e.target.value)}
            placeholder="+353..." className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
        </div>
        <div>
          <label className="text-xs tracking-wider mb-2 block" style={{ color: "var(--clay)" }}>WORKER TYPE</label>
          <div className="flex flex-wrap gap-2">
            {["barista", "chef", "both"].map(type => (
              <button key={type} type="button" onClick={() => update("worker_type", type)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm"
                style={formData.worker_type === type
                  ? { backgroundColor: type === "chef" ? "var(--sage)" : "var(--terracotta)", color: "white", border: "none" }
                  : { border: "1px solid var(--sand)", color: "var(--clay)", backgroundColor: "transparent" }
                }>
                {type === "barista" && <Coffee className="w-4 h-4" />}
                {type === "chef" && <ChefHat className="w-4 h-4" />}
                {type === "both" && <><Coffee className="w-4 h-4" /><ChefHat className="w-4 h-4" /></>}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs tracking-wider mb-2 block" style={{ color: "var(--clay)" }}>YEARS OF EXPERIENCE</label>
          <Input type="number" min="0" value={formData.experience_years}
            onChange={e => update("experience_years", parseInt(e.target.value) || 0)}
            className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
        </div>
      </div>

      <div>
        <label className="text-xs tracking-wider mb-2 block" style={{ color: "var(--clay)" }}>WORK AUTHORIZATION</label>
        <Select value={formData.visa_status} onValueChange={val => update("visa_status", val)}>
          <SelectTrigger className="rounded-xl border" style={{ borderColor: "var(--sand)" }}>
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="irish_citizen">Irish Citizen</SelectItem>
            <SelectItem value="eu_citizen">EU Citizen</SelectItem>
            <SelectItem value="stamp_1">Stamp 1 (39h/week)</SelectItem>
            <SelectItem value="stamp_2">Stamp 2 (20h/week)</SelectItem>
            <SelectItem value="stamp_3">Stamp 3</SelectItem>
            <SelectItem value="stamp_4">Stamp 4</SelectItem>
            <SelectItem value="student_visa">Student Visa (20h/week)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs tracking-wider" style={{ color: "var(--clay)" }}>PROFESSIONAL SUMMARY</label>
          <Button size="sm" variant="outline" onClick={generateSummary} disabled={generatingAI}
            className="rounded-xl text-xs" style={{ borderColor: "var(--terracotta)", color: "var(--terracotta)" }}>
            <Sparkles className="w-3 h-3 mr-1" />
            {generatingAI ? "Generating..." : "Generate with AI"}
          </Button>
        </div>
        <Textarea value={formData.professional_summary} onChange={e => update("professional_summary", e.target.value)}
          placeholder="A compelling 2–3 sentence summary of your hospitality career..."
          className="rounded-xl border" style={{ borderColor: "var(--sand)" }} rows={3} />
      </div>

      <div>
        <label className="text-xs tracking-wider mb-2 block" style={{ color: "var(--clay)" }}>BIO</label>
        <Textarea value={formData.bio} onChange={e => update("bio", e.target.value)}
          placeholder="Tell employers about yourself, your passion, and what makes you great..."
          className="rounded-xl border" style={{ borderColor: "var(--sand)" }} rows={3} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs tracking-wider mb-2 block" style={{ color: "var(--clay)" }}>DESIRED RATE (MIN) €/hr</label>
          <Input type="number" min="0" step="0.5" value={formData.desired_hourly_rate_min}
            onChange={e => update("desired_hourly_rate_min", parseFloat(e.target.value))}
            placeholder="12.00" className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
        </div>
        <div>
          <label className="text-xs tracking-wider mb-2 block" style={{ color: "var(--clay)" }}>DESIRED RATE (MAX) €/hr</label>
          <Input type="number" min="0" step="0.5" value={formData.desired_hourly_rate_max}
            onChange={e => update("desired_hourly_rate_max", parseFloat(e.target.value))}
            placeholder="20.00" className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
        </div>
      </div>

      {/* CV Upload */}
      <div>
        <label className="text-xs tracking-wider mb-2 block" style={{ color: "var(--clay)" }}>UPLOAD CV / RÉSUMÉ</label>
        {formData.resume_url ? (
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "var(--sand)" }}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: "var(--clay)" }} />
              <a href={formData.resume_url} target="_blank" rel="noreferrer" className="text-sm underline" style={{ color: "var(--earth)" }}>View CV</a>
              {extractingCV && <span className="text-xs" style={{ color: "var(--clay)" }}>Extracting experience...</span>}
            </div>
            <Button size="sm" variant="ghost" onClick={() => update("resume_url", "")}><X className="w-4 h-4" /></Button>
          </div>
        ) : (
          <label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleCVUpload} className="hidden" disabled={uploadingCV} />
            <Button type="button" variant="outline" className="rounded-xl w-full" disabled={uploadingCV}
              onClick={(e) => e.currentTarget.previousElementSibling.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {uploadingCV ? "Uploading & extracting..." : "Upload CV (auto-extracts experience)"}
            </Button>
          </label>
        )}
      </div>

      {/* Portfolio Link */}
      <div>
        <label className="text-xs tracking-wider mb-2 block" style={{ color: "var(--clay)" }}>PORTFOLIO LINK (OPTIONAL)</label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--clay)" }} />
          <Input value={formData.portfolio_link} onChange={e => update("portfolio_link", e.target.value)}
            placeholder="https://yourportfolio.com" className="rounded-xl border pl-9" style={{ borderColor: "var(--sand)" }} />
        </div>
      </div>
    </div>,

    // Step 1: Skills
    <div key="skills" className="space-y-6">
      <div>
        <h2 className="text-2xl font-light mb-1" style={{ fontFamily: "Crimson Pro, serif", color: "var(--earth)" }}>Skills</h2>
        <p className="text-sm" style={{ color: "var(--clay)" }}>Select every skill that applies to you — the more you add, the better your matches.</p>
      </div>

      {(formData.worker_type === "barista" || formData.worker_type === "both") && (
        <div>
          <label className="text-xs tracking-wider mb-3 block flex items-center gap-2" style={{ color: "var(--clay)" }}>
            <Coffee className="w-4 h-4" /> BARISTA & FRONT-OF-HOUSE SKILLS
          </label>
          <div className="flex flex-wrap gap-2">
            {baristaSkillOptions.map(skill => (
              <SkillBadge key={skill} label={skill.replace(/_/g, " ")}
                active={formData.barista_skills.includes(skill)}
                onClick={() => toggleSkill(skill, "barista")} color="terracotta" />
            ))}
          </div>
        </div>
      )}

      {(formData.worker_type === "chef" || formData.worker_type === "both") && (
        <div>
          <label className="text-xs tracking-wider mb-3 block flex items-center gap-2" style={{ color: "var(--clay)" }}>
            <ChefHat className="w-4 h-4" /> KITCHEN & CHEF SKILLS
          </label>
          <div className="flex flex-wrap gap-2">
            {chefSkillOptions.map(skill => (
              <SkillBadge key={skill} label={skill.replace(/_/g, " ")}
                active={formData.chef_skills.includes(skill)}
                onClick={() => toggleSkill(skill, "chef")} color="sage" />
            ))}
          </div>
        </div>
      )}
    </div>,

    // Step 2: Work Experience
    <div key="experience" className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-light mb-1" style={{ fontFamily: "Crimson Pro, serif", color: "var(--earth)" }}>Work Experience</h2>
          <p className="text-sm" style={{ color: "var(--clay)" }}>List your previous roles. Upload a CV above to auto-fill this section.</p>
        </div>
        <Button size="sm" variant="outline" onClick={addWorkExp} className="rounded-xl flex-shrink-0" style={{ borderColor: "var(--sand)" }}>
          <Plus className="w-4 h-4 mr-1" /> Add Role
        </Button>
      </div>
      {formData.work_experience.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ backgroundColor: "var(--cream)", border: "1px dashed var(--sand)" }}>
          <Briefcase className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--sand)" }} />
          <p className="font-light" style={{ color: "var(--clay)" }}>No experience added yet. Click "Add Role" or upload a CV.</p>
        </div>
      ) : (
        formData.work_experience.map((exp, i) => (
          <div key={i} className="p-4 rounded-xl space-y-3" style={{ backgroundColor: "var(--cream)", border: "1px solid var(--sand)" }}>
            <div className="flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => removeWorkExp(i)}><Trash2 className="w-4 h-4" style={{ color: "var(--clay)" }} /></Button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Input placeholder="Job title" value={exp.job_title || ""} onChange={e => updateWorkExp(i, "job_title", e.target.value)} className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
              <Input placeholder="Company / venue" value={exp.company || ""} onChange={e => updateWorkExp(i, "company", e.target.value)} className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
            </div>
            <Input placeholder="Location" value={exp.location || ""} onChange={e => updateWorkExp(i, "location", e.target.value)} className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="month" value={exp.start_date || ""} onChange={e => updateWorkExp(i, "start_date", e.target.value)} className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
              {!exp.current && (
                <Input type="month" value={exp.end_date || ""} onChange={e => updateWorkExp(i, "end_date", e.target.value)} className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={exp.current || false} onChange={e => updateWorkExp(i, "current", e.target.checked)} className="rounded" />
              <span className="text-sm" style={{ color: "var(--clay)" }}>I currently work here</span>
            </label>
            <Textarea placeholder="Key responsibilities and achievements..." value={exp.description || ""} onChange={e => updateWorkExp(i, "description", e.target.value)} className="rounded-xl border" style={{ borderColor: "var(--sand)" }} rows={2} />
          </div>
        ))
      )}
    </div>,

    // Step 3: Certifications
    <div key="certifications" className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-light mb-1" style={{ fontFamily: "Crimson Pro, serif", color: "var(--earth)" }}>Certifications</h2>
          <p className="text-sm" style={{ color: "var(--clay)" }}>Food safety, barista courses, health & hygiene — add anything relevant.</p>
        </div>
        <Button size="sm" variant="outline" onClick={addCert} className="rounded-xl flex-shrink-0" style={{ borderColor: "var(--sand)" }}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
      {formData.certifications.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ backgroundColor: "var(--cream)", border: "1px dashed var(--sand)" }}>
          <Award className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--sand)" }} />
          <p className="font-light" style={{ color: "var(--clay)" }}>No certifications yet. Click "Add" to get started.</p>
        </div>
      ) : (
        formData.certifications.map((cert, i) => (
          <div key={i} className="p-4 rounded-xl space-y-3" style={{ backgroundColor: "var(--cream)", border: "1px solid var(--sand)" }}>
            <div className="flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => removeCert(i)}><Trash2 className="w-4 h-4" style={{ color: "var(--clay)" }} /></Button>
            </div>
            <Input placeholder="Certification name (e.g., Food Safety Level 2)" value={cert.name || ""} onChange={e => updateCert(i, "name", e.target.value)} className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
            <Input placeholder="Issuing organisation (e.g., FSAI)" value={cert.issuer || ""} onChange={e => updateCert(i, "issuer", e.target.value)} className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
            <Input type="date" value={cert.date_obtained || ""} onChange={e => updateCert(i, "date_obtained", e.target.value)} className="rounded-xl border" style={{ borderColor: "var(--sand)" }} />
          </div>
        ))
      )}
    </div>,

    // Step 4: Availability
    <div key="availability" className="space-y-6">
      <div>
        <h2 className="text-2xl font-light mb-1" style={{ fontFamily: "Crimson Pro, serif", color: "var(--earth)" }}>Availability</h2>
        <p className="text-sm" style={{ color: "var(--clay)" }}>Tell employers when you're free to work.</p>
      </div>
      <div>
        <label className="text-xs tracking-wider mb-3 block" style={{ color: "var(--clay)" }}>AVAILABLE DAYS</label>
        <div className="flex flex-wrap gap-2">
          {dayOptions.map(day => (
            <SkillBadge key={day} label={day.charAt(0).toUpperCase() + day.slice(1)}
              active={formData.availability.includes(day)}
              onClick={() => toggleDay(day)} color="sage" />
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs tracking-wider mb-3 block" style={{ color: "var(--clay)" }}>PREFERRED SHIFT TIMES</label>
        <div className="flex flex-wrap gap-2">
          {shiftTimeOptions.map(t => (
            <SkillBadge key={t.value} label={t.label}
              active={formData.preferred_shift_times.includes(t.value)}
              onClick={() => toggleShiftTime(t.value)} color="olive" />
          ))}
        </div>
      </div>
    </div>,

    // Step 5: Portfolio
    <div key="portfolio" className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-light mb-1" style={{ fontFamily: "Crimson Pro, serif", color: "var(--earth)" }}>Portfolio</h2>
          <p className="text-sm" style={{ color: "var(--clay)" }}>
            {formData.worker_type === "chef" ? "Show off your plated dishes and kitchen work." : "Showcase your latte art, coffee setup, and hospitality moments."}
          </p>
        </div>
        <label>
          <input type="file" accept="image/*" onChange={handlePortfolioUpload} className="hidden" disabled={uploadingPortfolio} />
          <Button type="button" size="sm" variant="outline" className="rounded-xl flex-shrink-0" style={{ borderColor: "var(--sand)" }}
            disabled={uploadingPortfolio} onClick={e => e.currentTarget.previousElementSibling.click()}>
            <Camera className="w-4 h-4 mr-1" />
            {uploadingPortfolio ? "Uploading..." : "Add Photo"}
          </Button>
        </label>
      </div>
      {formData.skill_portfolio.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ backgroundColor: "var(--cream)", border: "1px dashed var(--sand)" }}>
          <Camera className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--sand)" }} />
          <p className="font-light" style={{ color: "var(--clay)" }}>No portfolio photos yet. Click "Add Photo" to showcase your work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {formData.skill_portfolio.map((item, i) => (
            <div key={i} className="relative group">
              <img src={item.image_url} alt={item.title} className="w-full aspect-square object-cover rounded-xl" />
              <Button size="sm" variant="destructive" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                onClick={() => removePortfolio(i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
              <Input placeholder="Title" value={item.title || ""} onChange={e => updatePortfolio(i, "title", e.target.value)}
                className="mt-2 rounded-xl border text-sm" style={{ borderColor: "var(--sand)" }} />
            </div>
          ))}
        </div>
      )}

      {/* Also show portfolio link here */}
      <div>
        <label className="text-xs tracking-wider mb-2 block" style={{ color: "var(--clay)" }}>EXTERNAL PORTFOLIO LINK</label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--clay)" }} />
          <Input value={formData.portfolio_link} onChange={e => update("portfolio_link", e.target.value)}
            placeholder="https://yourportfolio.com or LinkedIn" className="rounded-xl border pl-9" style={{ borderColor: "var(--sand)" }} />
        </div>
      </div>
    </div>,
  ];

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      {/* Header */}
      <div className="border-b px-6 py-4 sticky top-0 z-10" style={{ backgroundColor: "var(--warm-white)", borderColor: "var(--sand)" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-light" style={{ fontFamily: "Crimson Pro, serif", color: "var(--earth)" }}>
            Profile Builder
          </h1>
          {onClose && (
            <Button variant="ghost" onClick={onClose} className="rounded-xl" style={{ color: "var(--clay)" }}>
              <X className="w-5 h-5 mr-1" /> Close
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Step Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(i)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-normal whitespace-nowrap transition-all"
                style={isActive
                  ? { backgroundColor: "var(--terracotta)", color: "white" }
                  : isDone
                    ? { backgroundColor: "var(--sand)", color: "var(--earth)" }
                    : { backgroundColor: "transparent", color: "var(--clay)", border: "1px solid var(--sand)" }
                }
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="rounded-2xl p-6 md:p-8 mb-6" style={{ backgroundColor: "var(--warm-white)", border: "1px solid var(--sand)" }}>
          {stepContent[currentStep]}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="rounded-xl"
            style={{ borderColor: "var(--sand)", color: "var(--clay)" }}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <div className="flex gap-2">
            {isLastStep ? (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl px-8 font-normal"
                style={{ backgroundColor: "var(--sage)", color: "white" }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl font-normal"
                  style={{ borderColor: "var(--sand)", color: "var(--clay)" }}
                >
                  {saving ? "Saving..." : "Save & Exit"}
                </Button>
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="rounded-xl px-6 font-normal"
                  style={{ backgroundColor: "var(--terracotta)", color: "white" }}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}