import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Globe, MessageSquare, Plus } from "lucide-react";
import ReviewCard from "../reviews/ReviewCard";

export default function RoasterModal({ roaster, onClose }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', roaster.id],
    queryFn: () => base44.entities.Review.filter({ review_type: 'roaster', target_id: roaster.id }, '-created_date'),
    initialData: [],
  });

  const createReviewMutation = useMutation({
    mutationFn: (reviewData) => base44.entities.Review.create(reviewData),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', roaster.id] });
      queryClient.invalidateQueries({ queryKey: ['roasters'] });
      
      const allReviews = await base44.entities.Review.filter({ review_type: 'roaster', target_id: roaster.id });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await base44.entities.Roaster.update(roaster.id, {
        average_rating: avgRating,
        total_reviews: allReviews.length
      });

      setShowReviewForm(false);
      setTitle("");
      setContent("");
      setRating(5);
    },
  });

  const handleSubmitReview = () => {
    if (!content.trim()) return;

    createReviewMutation.mutate({
      review_type: 'roaster',
      target_id: roaster.id,
      target_name: roaster.name,
      rating,
      title: title.trim() || undefined,
      content: content.trim(),
      reviewer_name: user?.full_name || 'Anonymous',
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl" style={{ backgroundColor: 'var(--warm-white)' }}>
        <DialogHeader>
          <div className="h-48 -mx-6 -mt-6 mb-4 bg-gradient-to-br overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #8B4513, var(--coffee-brown))' }}>
            {roaster.logo_url ? (
              <img src={roaster.logo_url} alt={roaster.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-8xl font-bold text-white/20">
                  {roaster.name?.[0]?.toUpperCase()}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <DialogTitle className="text-3xl font-bold text-white mb-2">{roaster.name}</DialogTitle>
              <div className="flex items-center gap-3 text-white/90">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-current text-yellow-400" />
                  <span className="font-bold">{roaster.average_rating > 0 ? roaster.average_rating.toFixed(1) : 'New'}</span>
                </div>
                <span>•</span>
                <span>{roaster.total_reviews || 0} reviews</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-0.5" style={{ color: 'var(--coffee-brown)' }} />
              <div>
                <div className="font-semibold mb-1" style={{ color: 'var(--espresso)' }}>Location</div>
                <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>
                  {roaster.location}
                </div>
              </div>
            </div>
            {roaster.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 mt-0.5" style={{ color: 'var(--coffee-brown)' }} />
                <div>
                  <div className="font-semibold mb-1" style={{ color: 'var(--espresso)' }}>Website</div>
                  <a href={roaster.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'var(--fresh-green)' }}>
                    {roaster.website}
                  </a>
                </div>
              </div>
            )}
          </div>

          {roaster.description && (
            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--espresso)' }}>About</h3>
              <p className="text-sm" style={{ color: 'var(--coffee-brown)' }}>{roaster.description}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {roaster.roast_style && roaster.roast_style.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--espresso)' }}>Roast Styles</h3>
                <div className="flex flex-wrap gap-2">
                  {roaster.roast_style.map((style, idx) => (
                    <Badge key={idx} style={{ backgroundColor: 'var(--latte)', color: 'var(--coffee-brown)' }}>
                      {style} roast
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {roaster.origin_focus && roaster.origin_focus.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--espresso)' }}>Origins</h3>
                <div className="flex flex-wrap gap-2">
                  {roaster.origin_focus.map((origin, idx) => (
                    <Badge key={idx} variant="outline" style={{ borderColor: 'var(--latte)', color: 'var(--coffee-brown)' }}>
                      {origin}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="pt-6 border-t" style={{ borderColor: 'var(--latte)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--espresso)' }}>
                <MessageSquare className="w-5 h-5" />
                Reviews ({reviews.length})
              </h3>
              {!showReviewForm && (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--fresh-green), #7FA32E)', color: 'white' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Write Review
                </Button>
              )}
            </div>

            {showReviewForm && (
              <div className="mb-6 p-6 rounded-2xl" style={{ backgroundColor: 'white' }}>
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
                    style={{ borderColor: 'var(--latte)' }}
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
                      style={{ background: 'linear-gradient(135deg, var(--fresh-green), #7FA32E)', color: 'white' }}
                    >
                      {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                      className="rounded-xl"
                      style={{ borderColor: 'var(--latte)', color: 'var(--coffee-brown)' }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: 'white' }}>
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
      </DialogContent>
    </Dialog>
  );
}