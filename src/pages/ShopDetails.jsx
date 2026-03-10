import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Mail, MessageSquare, Plus, ArrowLeft } from "lucide-react";
import ReviewCard from "../components/reviews/ReviewCard";
import VenueRatingBreakdown from "../components/reviews/VenueRatingBreakdown";
import { toast } from "sonner";

export default function ShopDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: shop, isLoading } = useQuery({
    queryKey: ['coffeeShop', id],
    queryFn: async () => {
      const shops = await base44.entities.CoffeeShop.filter({ id });
      return shops[0];
    }
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => base44.entities.Review.filter({ review_type: 'coffee_shop', target_id: id }, '-created_date'),
    initialData: [],
    enabled: !!id
  });

  const createReviewMutation = useMutation({
    mutationFn: (reviewData) => base44.entities.Review.create(reviewData),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['coffeeShops'] });
      
      const allReviews = await base44.entities.Review.filter({ review_type: 'coffee_shop', target_id: id });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await base44.entities.CoffeeShop.update(id, {
        average_rating: avgRating,
        total_reviews: allReviews.length
      });

      setShowReviewForm(false);
      setTitle("");
      setContent("");
      setRating(5);
      toast.success('Review posted!');
    },
  });

  const handleSubmitReview = () => {
    if (!content.trim()) return;

    createReviewMutation.mutate({
      review_type: 'coffee_shop',
      target_id: id,
      target_name: shop.name,
      rating,
      title: title.trim() || undefined,
      content: content.trim(),
      reviewer_name: user?.full_name || 'Anonymous',
    });
  };

  if (isLoading || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      {/* Mobile Header with Back Button */}
      <header className="md:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3" style={{ backgroundColor: 'var(--warm-white)', borderBottom: '1px solid var(--sand)' }}>
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <ArrowLeft className="w-6 h-6" style={{ color: 'var(--earth)' }} />
        </button>
        <h1 className="text-lg font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
          {shop.name}
        </h1>
      </header>

      <div className="max-w-4xl mx-auto p-6 md:p-12">
        {/* Hero Section with Custom Colors */}
        <div 
          className="h-64 rounded-3xl overflow-hidden relative mb-8" 
          style={{ 
            background: shop.hero_image_url 
              ? 'transparent' 
              : shop.custom_colors?.primary 
                ? `linear-gradient(135deg, ${shop.custom_colors.primary}, ${shop.custom_colors.secondary || shop.custom_colors.primary})` 
                : 'linear-gradient(135deg, var(--cream), var(--latte))'
          }}
        >
          {shop.hero_image_url ? (
            <img src={shop.hero_image_url} alt={shop.name} className="w-full h-full object-cover" />
          ) : shop.logo_url ? (
            <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-8xl font-bold opacity-20" style={{ color: 'var(--coffee-brown)' }}>
                {shop.name?.[0]?.toUpperCase()}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <h2 className="text-4xl font-light text-white mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>{shop.name}</h2>
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-current text-yellow-400" />
                <span className="font-bold">{shop.average_rating > 0 ? shop.average_rating.toFixed(1) : 'New'}</span>
              </div>
              <span>•</span>
              <span>{shop.total_reviews || 0} reviews</span>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {shop.gallery && shop.gallery.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Gallery
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {shop.gallery.map((url, idx) => (
                <img 
                  key={idx}
                  src={url} 
                  alt={`${shop.name} photo ${idx + 1}`} 
                  className="w-full h-48 rounded-2xl object-cover hover-lift cursor-pointer"
                  onClick={() => window.open(url, '_blank')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--warm-white)' }}>
            <MapPin className="w-5 h-5 mt-0.5" style={{ color: 'var(--coffee-brown)' }} />
            <div>
              <div className="font-semibold mb-1" style={{ color: 'var(--espresso)' }}>Location</div>
              <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>
                {shop.address || shop.location}
              </div>
            </div>
          </div>
          {shop.contact_email && (
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--warm-white)' }}>
              <Mail className="w-5 h-5 mt-0.5" style={{ color: 'var(--coffee-brown)' }} />
              <div>
                <div className="font-semibold mb-1" style={{ color: 'var(--espresso)' }}>Email</div>
                <a href={`mailto:${shop.contact_email}`} className="text-sm hover:underline" style={{ color: 'var(--fresh-green)' }}>
                  {shop.contact_email}
                </a>
              </div>
            </div>
          )}
          {shop.contact_phone && (
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--warm-white)' }}>
              <Phone className="w-5 h-5 mt-0.5" style={{ color: 'var(--coffee-brown)' }} />
              <div>
                <div className="font-semibold mb-1" style={{ color: 'var(--espresso)' }}>Phone</div>
                <a href={`tel:${shop.contact_phone}`} className="text-sm hover:underline" style={{ color: 'var(--fresh-green)' }}>
                  {shop.contact_phone}
                </a>
              </div>
            </div>
          )}
        </div>

        {shop.description && (
          <div className="p-6 rounded-2xl mb-8" style={{ backgroundColor: 'var(--warm-white)' }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--espresso)' }}>About</h3>
            <p className="text-sm" style={{ color: 'var(--coffee-brown)' }}>{shop.description}</p>
          </div>
        )}

        {shop.specialty_focus && shop.specialty_focus.length > 0 && (
          <div className="p-6 rounded-2xl mb-8" style={{ backgroundColor: 'var(--warm-white)' }}>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--espresso)' }}>Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {shop.specialty_focus.map((specialty, idx) => (
                <Badge key={idx} style={{ backgroundColor: 'var(--latte)', color: 'var(--coffee-brown)' }}>
                  {specialty.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-light flex items-center gap-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              <MessageSquare className="w-6 h-6" />
              Reviews ({reviews.length})
            </h3>
            {!showReviewForm && (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="rounded-xl"
                style={{ background: 'linear-gradient(135deg, var(--fresh-green), #7FA32E)', color: 'white', minHeight: '44px' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-6 p-6 rounded-2xl" style={{ backgroundColor: 'var(--warm-white)' }}>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--espresso)' }}>Write Your Review</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--coffee-brown)' }}>
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-all duration-200"
                        style={{ minHeight: '44px', minWidth: '44px' }}
                      >
                        <Star
                          className={`w-8 h-8 ${star <= rating ? 'fill-current' : ''}`}
                          style={{ color: star <= rating ? 'var(--fresh-green)' : 'var(--latte)' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  placeholder="Review title (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl"
                  style={{ borderColor: 'var(--latte)', minHeight: '44px' }}
                />
                <Textarea
                  placeholder="Share your experience..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-32 rounded-xl"
                  style={{ borderColor: 'var(--latte)' }}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={createReviewMutation.isPending || !content.trim()}
                    className="rounded-xl"
                    style={{ background: 'linear-gradient(135deg, var(--fresh-green), #7FA32E)', color: 'white', minHeight: '44px' }}
                  >
                    {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="rounded-xl"
                    style={{ borderColor: 'var(--latte)', color: 'var(--coffee-brown)', minHeight: '44px' }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: 'var(--warm-white)' }}>
                <MessageSquare className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--latte)' }} />
                <p style={{ color: 'var(--coffee-brown)' }}>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}