import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Store, Star, TrendingUp } from "lucide-react";
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
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center shadow-2xl">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                Coffee Shops
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Explore and review Ireland's specialty coffee scene 🏪
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-orange-400" />
            <Input
              placeholder="Search coffee shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-16 rounded-3xl border-0 text-lg shadow-xl bg-white focus:shadow-2xl transition-all duration-300"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-orange-500 to-red-600 text-white relative overflow-hidden"
          >
            <div className="text-4xl font-bold mb-2">
              {filteredShops.length}
            </div>
            <div className="text-sm text-orange-100">Coffee Shops</div>
            <Store className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-white relative overflow-hidden"
          >
            <div className="flex items-center gap-2 text-4xl font-bold mb-2">
              <Star className="w-8 h-8 fill-current" />
              {(shops.reduce((sum, s) => sum + (s.average_rating || 0), 0) / (shops.length || 1)).toFixed(1)}
            </div>
            <div className="text-sm text-yellow-100">Avg. Rating</div>
            <TrendingUp className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white col-span-2 md:col-span-1 relative overflow-hidden"
          >
            <div className="text-4xl font-bold mb-2">
              {shops.reduce((sum, s) => sum + (s.total_reviews || 0), 0)}
            </div>
            <div className="text-sm text-pink-100">Total Reviews</div>
            <Star className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
          </motion.div>
        </div>

        {/* Shops Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl animate-pulse bg-gradient-to-br from-orange-200 to-pink-200" />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-white shadow-xl">
            <Store className="w-24 h-24 mx-auto mb-4 text-orange-300" />
            <h3 className="text-3xl font-bold mb-2 text-gray-900">
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