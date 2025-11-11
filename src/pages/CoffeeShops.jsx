import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Store, Star } from "lucide-react";
import { motion } from "framer-motion";
import CoffeeShopCard from "../components/shops/CoffeeShopCard";
import CoffeeShopModal from "../components/shops/CoffeeShopModal";

export default function CoffeeShops() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShop, setSelectedShop] = useState(null);

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
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--warm-white)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Store className="w-8 h-8" style={{ color: 'var(--coffee-brown)' }} />
            <h1 className="text-4xl font-bold" style={{ color: 'var(--espresso)' }}>
              Coffee Shops
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--coffee-brown)' }}>
            Explore and review Ireland's specialty coffee scene
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--coffee-brown)' }} />
            <Input
              placeholder="Search coffee shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-2 text-lg shadow-sm"
              style={{ 
                borderColor: 'var(--latte)',
                backgroundColor: 'white'
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'white' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--espresso)' }}>
              {filteredShops.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Coffee Shops</div>
          </div>
          <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center gap-2 text-3xl font-bold mb-1" style={{ color: 'var(--fresh-green)' }}>
              <Star className="w-6 h-6 fill-current" />
              {(shops.reduce((sum, s) => sum + (s.average_rating || 0), 0) / (shops.length || 1)).toFixed(1)}
            </div>
            <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Avg. Rating</div>
          </div>
          <div className="p-4 rounded-2xl shadow-sm col-span-2 md:col-span-1" style={{ backgroundColor: 'white' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--espresso)' }}>
              {shops.reduce((sum, s) => sum + (s.total_reviews || 0), 0)}
            </div>
            <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Total Reviews</div>
          </div>
        </div>

        {/* Shops Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--latte)' }} />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--latte)' }} />
            <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--espresso)' }}>
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
                <CoffeeShopCard shop={shop} onClick={() => setSelectedShop(shop)} />
              </motion.div>
            ))}
          </div>
        )}

        {selectedShop && (
          <CoffeeShopModal shop={selectedShop} onClose={() => setSelectedShop(null)} />
        )}
      </div>
    </div>
  );
}