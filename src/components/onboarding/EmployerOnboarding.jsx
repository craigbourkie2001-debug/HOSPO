import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, ArrowRight, Briefcase } from "lucide-react";
import { toast } from "sonner";

const specialtyOptions = ['espresso', 'filter', 'cold_brew', 'latte_art', 'pour_over', 'aeropress'];
const cuisineOptions = ['irish', 'italian', 'french', 'asian', 'indian', 'mexican', 'american', 'seafood', 'vegetarian', 'fine_dining', 'casual', 'gastropub'];

export default function EmployerOnboarding({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [venueType, setVenueType] = useState('coffee_shop');
  const [formData, setFormData] = useState({
    company_name: '',
    venue_name: '',
    location: '',
    address: '',
    contact_phone: '',
    description: '',
    company_registration_number: '',
    specialty_focus: [],
    cuisine_type: [],
    website: '',
    instagram: '',
    employee_count: ''
  });
  const [loading, setLoading] = useState(false);

  const toggleSelection = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create the venue
      let venueId;
      if (venueType === 'coffee_shop') {
        const shop = await base44.entities.CoffeeShop.create({
          name: formData.venue_name,
          location: formData.location,
          address: formData.address,
          contact_email: user.email,
          contact_phone: formData.contact_phone,
          description: formData.description,
          specialty_focus: formData.specialty_focus
        });
        venueId = shop.id;
      } else {
        const restaurant = await base44.entities.Restaurant.create({
          name: formData.venue_name,
          location: formData.location,
          address: formData.address,
          contact_email: user.email,
          contact_phone: formData.contact_phone,
          description: formData.description,
          cuisine_type: formData.cuisine_type
        });
        venueId = restaurant.id;
      }

      // Update user with employer role and venue association
      const updates = {
        company_name: formData.company_name,
        company_registration_number: formData.company_registration_number,
        onboarding_completed: true,
        [venueType === 'coffee_shop' ? 'coffee_shop_id' : 'restaurant_id']: venueId
      };
      
      // Only update role if user is not admin (app owner)
      if (user.role !== 'admin') {
        updates.role = 'employer';
      }
      
      await base44.auth.updateMe(updates);

      toast.success('Welcome to Hospo Employer Platform!');
      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete setup: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-2xl rounded-3xl p-8 md:p-12" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--terracotta)' }}>
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Employer Setup
            </h2>
            <p className="text-sm" style={{ color: 'var(--clay)' }}>Step {step} of 4</p>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--earth)' }}>Venue Type</Label>
              <Select value={venueType} onValueChange={setVenueType}>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coffee_shop">Coffee Shop / Café</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--earth)' }}>Company Name</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Your business legal name"
                className="rounded-xl h-12"
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--earth)' }}>
                Company Registration Number *
              </Label>
              <Input
                value={formData.company_registration_number}
                onChange={(e) => setFormData({ ...formData, company_registration_number: e.target.value })}
                placeholder="CRO number (e.g., 123456)"
                className="rounded-xl h-12"
              />
              <p className="text-xs mt-2" style={{ color: 'var(--clay)' }}>
                Required for business verification
              </p>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!formData.company_name || !formData.company_registration_number}
              className="w-full rounded-xl h-12"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--earth)' }}>Venue Name</Label>
              <Input
                value={formData.venue_name}
                onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                placeholder="The name customers know"
                className="rounded-xl h-12"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-2 block" style={{ color: 'var(--earth)' }}>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Dublin, Cork, etc."
                  className="rounded-xl h-12"
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block" style={{ color: 'var(--earth)' }}>Phone</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+353..."
                  className="rounded-xl h-12"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--earth)' }}>Full Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
                className="rounded-xl h-12"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="rounded-xl h-12"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!formData.venue_name || !formData.location}
                className="flex-1 rounded-xl h-12"
                style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--earth)' }}>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell workers about your venue, culture, and what makes you special..."
                className="rounded-xl min-h-32"
              />
            </div>

            {venueType === 'coffee_shop' && (
              <div>
                <Label className="text-sm mb-3 block" style={{ color: 'var(--earth)' }}>Coffee Specialties</Label>
                <div className="grid grid-cols-2 gap-2">
                  {specialtyOptions.map(specialty => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleSelection('specialty_focus', specialty)}
                      className="px-4 py-3 rounded-xl text-sm transition-all"
                      style={{
                        backgroundColor: formData.specialty_focus.includes(specialty) ? 'var(--terracotta)' : 'var(--sand)',
                        color: formData.specialty_focus.includes(specialty) ? 'white' : 'var(--earth)'
                      }}
                    >
                      {specialty.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {venueType === 'restaurant' && (
              <div>
                <Label className="text-sm mb-3 block" style={{ color: 'var(--earth)' }}>Cuisine Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {cuisineOptions.map(cuisine => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => toggleSelection('cuisine_type', cuisine)}
                      className="px-4 py-3 rounded-xl text-sm transition-all"
                      style={{
                        backgroundColor: formData.cuisine_type.includes(cuisine) ? 'var(--terracotta)' : 'var(--sand)',
                        color: formData.cuisine_type.includes(cuisine) ? 'white' : 'var(--earth)'
                      }}
                    >
                      {cuisine.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="rounded-xl h-12"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                className="flex-1 rounded-xl h-12"
                style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--earth)' }}>Website (Optional)</Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourwebsite.ie"
                className="rounded-xl h-12"
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--earth)' }}>Instagram Handle (Optional)</Label>
              <Input
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@yourvenue"
                className="rounded-xl h-12"
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--earth)' }}>Approximate Team Size (Optional)</Label>
              <Input
                value={formData.employee_count}
                onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                placeholder="e.g. 5-10 employees"
                className="rounded-xl h-12"
              />
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 mt-1" />
                <div>
                  <h4 className="font-medium mb-2">You're all set!</h4>
                  <p className="text-sm opacity-90">
                    After setup, you'll be able to post shifts and job openings to attract talented hospitality workers across Ireland.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="rounded-xl h-12"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 rounded-xl h-12"
                style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}