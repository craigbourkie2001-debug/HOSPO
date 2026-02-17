import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ChefHat, MapPin, Star, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Restaurants() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list('-average_rating'),
    initialData: [],
  });

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.cuisine_type?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <MobileHeader title="Restaurants" icon={ChefHat} />
      <div className="min-h-screen p-6 md:p-12 md:pt-12 pt-24" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-light mb-3 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Restaurants
          </h1>
          <p className="text-lg font-light tracking-wide" style={{ color: 'var(--clay)' }}>
            Explore Ireland's culinary scene
          </p>
        </div>

        {/* Search */}
        <div className="mb-10">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
            <Input
              placeholder="Search restaurants or cuisine type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-14 rounded-2xl border text-base"
              style={{ 
                borderColor: 'var(--sand)',
                backgroundColor: 'var(--warm-white)'
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {filteredRestaurants.length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>RESTAURANTS</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--sage)', color: 'white' }}
          >
            <div className="flex items-center gap-2 text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              <Star className="w-6 h-6 fill-current" />
              {(restaurants.reduce((sum, r) => sum + (r.average_rating || 0), 0) / (restaurants.length || 1)).toFixed(1)}
            </div>
            <div className="text-xs tracking-wider opacity-90">AVG. RATING</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl col-span-2 md:col-span-1 hover-lift"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {[...new Set(restaurants.flatMap(r => r.cuisine_type || []))].length}
            </div>
            <div className="text-xs tracking-wider opacity-90">CUISINE TYPES</div>
          </motion.div>
        </div>

        {/* Restaurants Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--sand)' }} />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-24 rounded-2xl" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
            <ChefHat className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
            <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              No restaurants found
            </h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="overflow-hidden border rounded-2xl hover-lift cursor-pointer transition-all"
                  style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--sage)' }}>
                        {restaurant.logo_url ? (
                          <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <ChefHat className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-normal mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm font-light" style={{ color: 'var(--clay)' }}>
                          <MapPin className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
                          {restaurant.location}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {restaurant.average_rating > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 fill-current" style={{ color: 'var(--terracotta)' }} />
                        <span className="font-normal" style={{ color: 'var(--earth)' }}>
                          {restaurant.average_rating.toFixed(1)}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--clay)' }}>
                          ({restaurant.total_reviews || 0} reviews)
                        </span>
                      </div>
                    )}

                    {restaurant.description && (
                      <p className="text-sm font-light mb-4 line-clamp-2" style={{ color: 'var(--clay)' }}>
                        {restaurant.description}
                      </p>
                    )}

                    {restaurant.cuisine_type && restaurant.cuisine_type.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {restaurant.cuisine_type.slice(0, 4).map((cuisine, idx) => (
                          <Badge 
                            key={idx}
                            className="font-normal"
                            style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)', border: 'none' }}
                          >
                            {cuisine.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--clay)' }}>
                      {restaurant.contact_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {restaurant.contact_email}
                        </span>
                      )}
                      {restaurant.contact_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {restaurant.contact_phone}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}