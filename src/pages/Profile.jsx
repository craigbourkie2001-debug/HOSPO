import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Star, Briefcase, Award, MapPin, X } from "lucide-react";
import { toast } from "sonner";

const skillOptions = [
  "espresso", "latte_art", "filter", "pour_over", "cold_brew", 
  "customer_service", "training", "opening", "closing", "cash_handling", "management"
];

const dayOptions = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(userData => {
      setUser(userData);
      setFormData({
        bio: userData.bio || '',
        location: userData.location || '',
        phone: userData.phone || '',
        experience_years: userData.experience_years || 0,
        skills: userData.skills || [],
        certifications: userData.certifications || [],
        availability: userData.availability || []
      });
    }).catch(() => {});
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated successfully');
    },
  });

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
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
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 border rounded-2xl overflow-hidden" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <div className="h-32" style={{ backgroundColor: 'var(--sand)' }} />
          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-12">
              <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-light text-white" style={{ backgroundColor: 'var(--terracotta)', borderColor: 'var(--warm-white)', fontFamily: 'Crimson Pro, serif' }}>
                {user.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
                <h1 className="text-3xl font-normal mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  {user.full_name}
                </h1>
                <p className="font-light" style={{ color: 'var(--clay)' }}>{user.email}</p>
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

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardContent className="p-6 text-center">
              <Briefcase className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--sage)', strokeWidth: 1.5 }} />
              <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {user.shifts_completed || 0}
              </div>
              <div className="text-xs tracking-wider font-light" style={{ color: 'var(--clay)' }}>SHIFTS COMPLETED</div>
            </CardContent>
          </Card>

          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 fill-current" style={{ color: 'var(--terracotta)', strokeWidth: 1.5 }} />
              <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {user.rating > 0 ? user.rating.toFixed(1) : 'New'}
              </div>
              <div className="text-xs tracking-wider font-light" style={{ color: 'var(--clay)' }}>AVERAGE RATING</div>
            </CardContent>
          </Card>

          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
              <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {user.experience_years || 0}
              </div>
              <div className="text-xs tracking-wider font-light" style={{ color: 'var(--clay)' }}>YEARS EXPERIENCE</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  LOCATION
                </label>
                {isEditing ? (
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, Ireland"
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
                  PHONE
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
                  YEARS OF EXPERIENCE
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

            <div>
              <label className="text-xs tracking-wider mb-3 block font-normal" style={{ color: 'var(--clay)' }}>
                SKILLS
              </label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map(skill => (
                    <Badge
                      key={skill}
                      className="cursor-pointer transition-all duration-200 hover-lift rounded-xl px-3 py-1.5 font-normal tracking-wide"
                      style={formData.skills.includes(skill) ? { 
                        backgroundColor: 'var(--terracotta)',
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
                      {formData.skills.includes(skill) && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, idx) => (
                      <Badge key={idx} className="border-0 font-normal" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}>
                        {skill.replace(/_/g, ' ')}
                      </Badge>
                    ))
                  ) : (
                    <p className="font-light" style={{ color: 'var(--clay)' }}>No skills added yet</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs tracking-wider mb-3 block font-normal" style={{ color: 'var(--clay)' }}>
                AVAILABILITY
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
                      location: user.location || '',
                      phone: user.phone || '',
                      experience_years: user.experience_years || 0,
                      skills: user.skills || [],
                      certifications: user.certifications || [],
                      availability: user.availability || []
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
      </div>
    </div>
  );
}