import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Package, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ProductCard({ product }) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    // Prevent checkout inside an iframe
    if (window.self !== window.top) {
      toast.error('Checkout is only supported in the published app. Please open the app directly.');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('createProductCheckout', {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        currency: 'eur',
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to start checkout. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 border rounded-2xl hover-lift" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
      <div className="h-48 overflow-hidden relative" style={{ backgroundColor: 'var(--sand)' }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-16 h-16" style={{ color: 'var(--clay)', strokeWidth: 1 }} />
          </div>
        )}
        {product.rating > 0 && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" style={{ color: 'var(--terracotta)' }} />
              <span className="text-xs font-light">{product.rating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-normal mb-1 line-clamp-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            {product.name}
          </h3>
          <p className="text-xs font-light mb-2" style={{ color: 'var(--clay)' }}>{product.seller_name}</p>
          {product.description && (
            <p className="text-sm font-light line-clamp-2" style={{ color: 'var(--clay)' }}>
              {product.description}
            </p>
          )}
        </div>

        {product.tasting_notes && product.tasting_notes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.tasting_notes.slice(0, 3).map((note, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs font-normal border-0" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}>
                {note}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              €{product.price.toFixed(2)}
            </div>
            {product.total_sales > 0 && (
              <div className="text-xs font-light" style={{ color: 'var(--clay)' }}>
                {product.total_sales} sold
              </div>
            )}
          </div>
          <Button 
            className="rounded-xl font-normal tracking-wide transition-all hover-lift"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
            size="sm"
            onClick={handleBuy}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4 mr-1" />
            )}
            {loading ? 'Loading...' : 'Buy'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}