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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: 'var(--latte)', borderTopColor: 'var(--fresh-green)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--warm-white)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-8 border-2 rounded-2xl overflow-hidden" style={{ borderColor: 'var(--latte)' }}>
          <div className="h-32" style={{ background: 'linear-gradient(135deg, var(--fresh-green), var(--coffee-brown))' }} />
          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-12">
              <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-3xl font-bold text-white" style={{ backgroundColor: 'var(--coffee-brown)' }}>
                {user.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
                <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--espresso)' }}>
                  {user.full_name}
                </h1>
                <p style={{ color: 'var(--coffee-brown)' }}>{user.email}</p>
              </div>
              <Button
                onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
                disabled={updateProfileMutation.isPending}
                className="rounded-xl"
                style={{ background: isEditing ? 'linear-gradient(135deg, var(--fresh-green), #7FA32E)' : 'var(--latte)', color: isEditing ? 'white' : 'var(--espresso)' }}
              >
                {updateProfileMutation.isPending ? 'Saving...' : isEditing ? 'Save Profile' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 rounded-2xl" style={{ borderColor: 'var(--latte)' }}>
            <CardContent className="p-6 text-center">
              <Briefcase className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--fresh-green)' }} />
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--espresso)' }}>
                {user.shifts_completed || 0}
              </div>
              <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Shifts Completed</div>
            </CardContent>
          </Card>

          <Card className="border-2 rounded-2xl" style={{ borderColor: 'var(--latte)' }}>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 fill-current" style={{ color: 'var(--fresh-green)' }} />
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--espresso)' }}>
                {user.rating > 0 ? user.rating.toFixed(1) : 'New'}
              </div>
              <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Average Rating</div>
            </CardContent>
          </Card>

          <Card className="border-2 rounded-2xl" style={{ borderColor: 'var(--latte)' }}>
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--fresh-green)' }} />
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--espresso)' }}>
                {user.experience_years || 0}
              </div>
              <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Years Experience</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <Card className="border-2 rounded-2xl" style={{ borderColor: 'var(--latte)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--espresso)' }}>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bio */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--coffee-brown)' }}>
                Bio
              </label>
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="rounded-xl"
                  style={{ borderColor: 'var(--latte)' }}
                />
              ) : (
                <p style={{ color: 'var(--espresso)' }}>
                  {user.bio || 'No bio added yet'}
                </p>
              )}
            </div>

            {/* Location & Contact */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--coffee-brown)' }}>
                  Location
                </label>
                {isEditing ? (
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, Ireland"
                    className="rounded-xl"
                    style={{ borderColor: 'var(--latte)' }}
                  />
                ) : (
                  <div className="flex items-center gap-2" style={{ color: 'var(--espresso)' }}>
                    <MapPin className="w-4 h-4" />
                    {user.location || 'Not specified'}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--coffee-brown)' }}>
                  Phone
                </label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+353..."
                    className="rounded-xl"
                    style={{ borderColor: 'var(--latte)' }}
                  />
                ) : (
                  <p style={{ color: 'var(--espresso)' }}>
                    {user.phone || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--coffee-brown)' }}>
                  Years of Experience
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) }))}
                    className="rounded-xl"
                    style={{ borderColor: 'var(--latte)' }}
                  />
                ) : (
                  <p style={{ color: 'var(--espresso)' }}>
                    {user.experience_years || 0} years
                  </p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--coffee-brown)' }}>
                Skills
              </label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map(skill => (
                    <Badge
                      key={skill}
                      variant={formData.skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-200 hover:shadow-md rounded-lg px-3 py-1.5"
                      style={formData.skills.includes(skill) ? { 
                        backgroundColor: 'var(--fresh-green)',
                        color: 'white'
                      } : {
                        borderColor: 'var(--latte)',
                        color: 'var(--coffee-brown)'
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
                      <Badge key={idx} style={{ backgroundColor: 'var(--latte)', color: 'var(--coffee-brown)' }}>
                        {skill.replace(/_/g, ' ')}
                      </Badge>
                    ))
                  ) : (
                    <p style={{ color: 'var(--coffee-brown)' }}>No skills added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Availability */}
            <div>
              <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--coffee-brown)' }}>
                Availability
              </label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map(day => (
                    <Badge
                      key={day}
                      variant={formData.availability.includes(day) ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-200 hover:shadow-md rounded-lg px-3 py-1.5"
                      style={formData.availability.includes(day) ? { 
                        backgroundColor: 'var(--fresh-green)',
                        color: 'white'
                      } : {
                        borderColor: 'var(--latte)',
                        color: 'var(--coffee-brown)'
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
                      <Badge key={idx} style={{ backgroundColor: 'var(--latte)', color: 'var(--coffee-brown)' }}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Badge>
                    ))
                  ) : (
                    <p style={{ color: 'var(--coffee-brown)' }}>No availability set</p>
                  )}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={updateProfileMutation.isPending}
                  className="rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--fresh-green), #7FA32E)', color: 'white' }}
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
                  className="rounded-xl"
                  style={{ borderColor: 'var(--latte)', color: 'var(--coffee-brown)' }}
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