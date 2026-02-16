import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Store, Star } from "lucide-react";
import { motion } from "framer-motion";
import CoffeeShopCard from "../components/shops/CoffeeShopCard";
import { useNavigate } from "react-router-dom";

export default function CoffeeShops() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: shops, isLoading } = useQuery({
    queryKey: ['coffeeShops'],
    queryFn: () => base44.entities.CoffeeShop.list('-average_rating'),
    initialData: [],
  });

  const filteredShops = shops.filter(shop =>
    shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-light mb-3 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Coffee Shops
          </h1>
          <p className="text-lg font-light tracking-wide" style={{ color: 'var(--clay)' }}>
            Explore Ireland's specialty coffee scene
          </p>
        </div>

        {/* Search */}
        <div className="mb-10">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
            <Input
              placeholder="Search coffee shops..."
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
              {filteredShops.length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>COFFEE SHOPS</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            <div className="flex items-center gap-2 text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              <Star className="w-6 h-6 fill-current" />
              {(shops.reduce((sum, s) => sum + (s.average_rating || 0), 0) / (shops.length || 1)).toFixed(1)}
            </div>
            <div className="text-xs tracking-wider opacity-90">AVG. RATING</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl col-span-2 md:col-span-1 hover-lift"
            style={{ backgroundColor: 'var(--sage)', color: 'white' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {shops.reduce((sum, s) => sum + (s.total_reviews || 0), 0)}
            </div>
            <div className="text-xs tracking-wider opacity-90">TOTAL REVIEWS</div>
          </motion.div>
        </div>

        {/* Shops Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--sand)' }} />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-24 rounded-2xl" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
            <Store className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
            <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              No coffee shops found
            </h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop, index) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CoffeeShopCard shop={shop} onClick={() => navigate(`/shops/${shop.id}`)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}