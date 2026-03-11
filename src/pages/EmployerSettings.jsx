import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Upload, Building2, DollarSign, Bell, Image, Palette, X, MapPin, Loader2 } from "lucide-react";
import { geocodeIrishAddress } from "../components/shifts/geoUtils";
import { toast } from "sonner";

export default function EmployerSettings() {
  const [user, setUser] = useState(null);
  const [venue, setVenue] = useState(null);
  const [venueType, setVenueType] = useState('restaurant');
  const [venueForm, setVenueForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [customColors, setCustomColors] = useState({
    primary: '#C89F8C',
    secondary: '#8A9B8E',
    accent: '#705D56'
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    new_applications: true,
    shift_filled: true,
    shift_cancelled: false,
    payment_updates: true
  });
  const [defaultRates, setDefaultRates] = useState({
    barista_rate: 14,
    commis_chef_rate: 16,
    chef_de_partie_rate: 18,
    sous_chef_rate: 22,
    head_chef_rate: 26
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(async (userData) => {
      setUser(userData);
      
      // Load venue
      if (userData.restaurant_id) {
        const restaurants = await base44.entities.Restaurant.filter({ id: userData.restaurant_id });
        if (restaurants.length > 0) {
          setVenue(restaurants[0]);
          setVenueType('restaurant');
          setVenueForm(restaurants[0]);
          if (restaurants[0].custom_colors) {
            setCustomColors(restaurants[0].custom_colors);
          }
        }
      } else if (userData.coffee_shop_id) {
        const shops = await base44.entities.CoffeeShop.filter({ id: userData.coffee_shop_id });
        if (shops.length > 0) {
          setVenue(shops[0]);
          setVenueType('coffee_shop');
          setVenueForm(shops[0]);
          if (shops[0].custom_colors) {
            setCustomColors(shops[0].custom_colors);
          }
        }
      }

      // Load notification preferences
      if (userData.notification_preferences) {
        setNotificationPrefs({ ...notificationPrefs, ...userData.notification_preferences });
      }

      // Load default rates
      if (userData.default_pay_rates) {
        setDefaultRates({ ...defaultRates, ...userData.default_pay_rates });
      }
    }).catch(() => {});
  }, []);

  const updateVenueMutation = useMutation({
    mutationFn: async (data) => {
      if (venueType === 'restaurant') {
        return base44.entities.Restaurant.update(venue.id, data);
      } else {
        return base44.entities.CoffeeShop.update(venue.id, data);
      }
    },
    onSuccess: () => {
      toast.success('Venue details updated');
      queryClient.invalidateQueries();
    },
  });

  const updateUserPrefsMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      toast.success('Preferences saved');
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setVenueForm({ ...venueForm, logo_url: file_url });
      toast.success('Logo uploaded');
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setVenueForm({ ...venueForm, hero_image_url: file_url });
      toast.success('Hero image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGallery(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const currentGallery = venueForm.gallery || [];
      setVenueForm({ ...venueForm, gallery: [...currentGallery, file_url] });
      toast.success('Image added to gallery');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeFromGallery = (index) => {
    const newGallery = [...(venueForm.gallery || [])];
    newGallery.splice(index, 1);
    setVenueForm({ ...venueForm, gallery: newGallery });
  };

  const handleSaveVenue = async () => {
    const { id, created_date, updated_date, created_by, ...data } = venueForm;
    // Geocode the address/location for accurate distance filtering
    const addressToGeocode = data.address || data.location;
    if (addressToGeocode && (!data.latitude || !data.longitude)) {
      const coords = await geocodeIrishAddress(addressToGeocode);
      if (coords) {
        data.latitude = coords.lat;
        data.longitude = coords.lng;
      }
    }
    updateVenueMutation.mutate({ ...data, custom_colors: customColors });
  };

  const handleSavePreferences = () => {
    updateUserPrefsMutation.mutate({
      notification_preferences: notificationPrefs,
      default_pay_rates: defaultRates
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
            <Building2 className="w-10 h-10" style={{ color: 'var(--terracotta)' }} />
          </div>
          <h2 className="text-3xl font-light mb-3" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            No Venue Connected
          </h2>
          <p className="mb-6" style={{ color: 'var(--clay)' }}>
            You need to complete the employer onboarding process to set up your venue before accessing settings.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-xl"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8" style={{ color: 'var(--terracotta)', strokeWidth: 1.5 }} />
            <h1 className="text-5xl font-light tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Employer Settings
            </h1>
          </div>
          <p className="font-light" style={{ color: 'var(--clay)' }}>
            Manage your venue details and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Company Profile */}
          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                <Building2 className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />
                Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                  Company Name
                </Label>
                <Input
                  value={user?.company_name || ''}
                  disabled
                  className="rounded-xl bg-gray-50"
                />
              </div>

              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                  Company Registration Number
                </Label>
                <Input
                  value={user?.company_registration_number || ''}
                  disabled
                  className="rounded-xl bg-gray-50"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--sage)' }}>
                  ✓ Business Verified
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Venue Details */}
          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                <Building2 className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />
                Venue Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                  Logo
                </Label>
                <div className="flex items-center gap-4">
                  {venueForm.logo_url && (
                    <img 
                      src={venueForm.logo_url} 
                      alt="Venue logo" 
                      className="w-20 h-20 rounded-lg object-cover"
                      style={{ border: '2px solid var(--sand)' }}
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => document.getElementById('logo-upload').click()}
                      variant="outline"
                      disabled={uploading}
                      className="rounded-xl font-normal"
                      style={{ borderColor: 'var(--sand)' }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                  Venue Name
                </Label>
                <Input
                  value={venueForm.name || ''}
                  onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                  Location
                </Label>
                <Input
                  value={venueForm.location || ''}
                  onChange={(e) => setVenueForm({ ...venueForm, location: e.target.value })}
                  className="rounded-xl"
                  placeholder="e.g., Dublin, Cork"
                />
              </div>

              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                  Address
                </Label>
                <Input
                  value={venueForm.address || ''}
                  onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
                  className="rounded-xl"
                  placeholder="Full address"
                />
              </div>

              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                  Description
                </Label>
                <Textarea
                  value={venueForm.description || ''}
                  onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })}
                  className="rounded-xl min-h-24"
                  placeholder="Tell workers about your venue"
                />
              </div>

              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                  Contact Email
                </Label>
                <Input
                  type="email"
                  value={venueForm.contact_email || ''}
                  onChange={(e) => setVenueForm({ ...venueForm, contact_email: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                  Contact Phone
                </Label>
                <Input
                  type="tel"
                  value={venueForm.contact_phone || ''}
                  onChange={(e) => setVenueForm({ ...venueForm, contact_phone: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <Button
                onClick={handleSaveVenue}
                disabled={updateVenueMutation.isPending}
                className="rounded-xl font-normal w-full"
                style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateVenueMutation.isPending ? 'Saving...' : 'Save Venue Details'}
              </Button>
            </CardContent>
          </Card>

          {/* Venue Appearance */}
          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                <Palette className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />
                Venue Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Image */}
              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                  Hero Banner Image
                </Label>
                <p className="text-xs mb-3" style={{ color: 'var(--clay)' }}>
                  Large banner image displayed at the top of your venue page
                </p>
                {venueForm.hero_image_url && (
                  <img 
                    src={venueForm.hero_image_url} 
                    alt="Hero" 
                    className="w-full h-40 rounded-xl object-cover mb-3"
                  />
                )}
                <input
                  type="file"
                  id="hero-upload"
                  accept="image/*"
                  onChange={handleHeroUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById('hero-upload').click()}
                  variant="outline"
                  disabled={uploading}
                  className="rounded-xl font-normal"
                  style={{ borderColor: 'var(--sand)' }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Hero Image'}
                </Button>
              </div>

              {/* Gallery */}
              <div>
                <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                  Photo Gallery
                </Label>
                <p className="text-xs mb-3" style={{ color: 'var(--clay)' }}>
                  Showcase your venue with multiple photos
                </p>
                {venueForm.gallery && venueForm.gallery.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {venueForm.gallery.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={url} 
                          alt={`Gallery ${idx + 1}`} 
                          className="w-full h-24 rounded-lg object-cover"
                        />
                        <button
                          onClick={() => removeFromGallery(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  id="gallery-upload"
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById('gallery-upload').click()}
                  variant="outline"
                  disabled={uploadingGallery}
                  className="rounded-xl font-normal"
                  style={{ borderColor: 'var(--sand)' }}
                >
                  <Image className="w-4 h-4 mr-2" />
                  {uploadingGallery ? 'Uploading...' : 'Add to Gallery'}
                </Button>
              </div>

              {/* Custom Colors */}
              <div>
                <Label className="text-sm font-normal mb-3 block" style={{ color: 'var(--earth)' }}>
                  Brand Colors
                </Label>
                <p className="text-xs mb-3" style={{ color: 'var(--clay)' }}>
                  Customize your venue page with your brand colors
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs mb-2 block" style={{ color: 'var(--clay)' }}>Primary</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={customColors.primary}
                        onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={customColors.primary}
                        onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                        className="rounded-lg flex-1"
                        placeholder="#C89F8C"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-2 block" style={{ color: 'var(--clay)' }}>Secondary</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={customColors.secondary}
                        onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={customColors.secondary}
                        onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                        className="rounded-lg flex-1"
                        placeholder="#8A9B8E"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-2 block" style={{ color: 'var(--clay)' }}>Accent</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={customColors.accent}
                        onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={customColors.accent}
                        onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                        className="rounded-lg flex-1"
                        placeholder="#705D56"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveVenue}
                disabled={updateVenueMutation.isPending}
                className="rounded-xl font-normal w-full"
                style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateVenueMutation.isPending ? 'Saving...' : 'Save Appearance'}
              </Button>
            </CardContent>
          </Card>

          {/* Default Pay Rates */}
          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                <DollarSign className="w-5 h-5" style={{ color: 'var(--sage)' }} />
                Default Pay Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-light mb-4" style={{ color: 'var(--clay)' }}>
                Set default hourly rates for quick shift posting
              </p>

              {venueType === 'coffee_shop' ? (
                <div>
                  <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                    Barista Rate (€/hour)
                  </Label>
                  <Input
                    type="number"
                    value={defaultRates.barista_rate}
                    onChange={(e) => setDefaultRates({ ...defaultRates, barista_rate: parseFloat(e.target.value) })}
                    className="rounded-xl"
                    min="0"
                    step="0.5"
                  />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                      Commis Chef (€/hour)
                    </Label>
                    <Input
                      type="number"
                      value={defaultRates.commis_chef_rate}
                      onChange={(e) => setDefaultRates({ ...defaultRates, commis_chef_rate: parseFloat(e.target.value) })}
                      className="rounded-xl"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                      Chef de Partie (€/hour)
                    </Label>
                    <Input
                      type="number"
                      value={defaultRates.chef_de_partie_rate}
                      onChange={(e) => setDefaultRates({ ...defaultRates, chef_de_partie_rate: parseFloat(e.target.value) })}
                      className="rounded-xl"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                      Sous Chef (€/hour)
                    </Label>
                    <Input
                      type="number"
                      value={defaultRates.sous_chef_rate}
                      onChange={(e) => setDefaultRates({ ...defaultRates, sous_chef_rate: parseFloat(e.target.value) })}
                      className="rounded-xl"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>
                      Head Chef (€/hour)
                    </Label>
                    <Input
                      type="number"
                      value={defaultRates.head_chef_rate}
                      onChange={(e) => setDefaultRates({ ...defaultRates, head_chef_rate: parseFloat(e.target.value) })}
                      className="rounded-xl"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleSavePreferences}
                disabled={updateUserPrefsMutation.isPending}
                className="rounded-xl font-normal w-full"
                style={{ backgroundColor: 'var(--sage)', color: 'white' }}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateUserPrefsMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                <Bell className="w-5 h-5" style={{ color: 'var(--olive)' }} />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-light mb-4" style={{ color: 'var(--clay)' }}>
                Choose which notifications you'd like to receive
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                  <div>
                    <div className="font-normal" style={{ color: 'var(--earth)' }}>New Applications</div>
                    <p className="text-xs font-light" style={{ color: 'var(--clay)' }}>
                      Get notified when workers apply for your shifts
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.new_applications}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, new_applications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                  <div>
                    <div className="font-normal" style={{ color: 'var(--earth)' }}>Shift Filled</div>
                    <p className="text-xs font-light" style={{ color: 'var(--clay)' }}>
                      Notify when a shift has been successfully filled
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.shift_filled}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, shift_filled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                  <div>
                    <div className="font-normal" style={{ color: 'var(--earth)' }}>Shift Cancelled</div>
                    <p className="text-xs font-light" style={{ color: 'var(--clay)' }}>
                      Get notified if a worker cancels a shift
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.shift_cancelled}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, shift_cancelled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                  <div>
                    <div className="font-normal" style={{ color: 'var(--earth)' }}>Payment Updates</div>
                    <p className="text-xs font-light" style={{ color: 'var(--clay)' }}>
                      Receive updates about payments and transactions
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.payment_updates}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, payment_updates: checked })}
                  />
                </div>
              </div>

              <Button
                onClick={handleSavePreferences}
                disabled={updateUserPrefsMutation.isPending}
                className="rounded-xl font-normal w-full"
                style={{ backgroundColor: 'var(--olive)', color: 'white' }}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateUserPrefsMutation.isPending ? 'Saving...' : 'Save Notification Preferences'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}