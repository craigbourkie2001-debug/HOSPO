import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Package } from "lucide-react";

export default function ProductCard({ product }) {
  const categoryGradients = {
    coffee_beans: 'from-amber-500 to-orange-600',
    brewing_equipment: 'from-blue-500 to-cyan-600',
    merchandise: 'from-pink-500 to-rose-600',
    subscription: 'from-green-500 to-emerald-600'
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 rounded-3xl bg-white">
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
        )}
        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-2xl bg-gradient-to-r ${categoryGradients[product.category]} text-white text-xs font-semibold shadow-lg`}>
          {product.category.replace(/_/g, ' ')}
        </div>
        {product.rating > 0 && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current text-yellow-500" />
              <span className="text-xs font-bold text-gray-900">{product.rating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{product.seller_name}</p>
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {product.tasting_notes && product.tasting_notes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tasting_notes.slice(0, 3).map((note, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                {note}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              €{product.price.toFixed(2)}
            </div>
            {product.total_sales > 0 && (
              <div className="text-xs text-gray-500">
                {product.total_sales} sold
              </div>
            )}
          </div>
          <Button 
            className={`rounded-2xl font-semibold bg-gradient-to-r ${categoryGradients[product.category]} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}