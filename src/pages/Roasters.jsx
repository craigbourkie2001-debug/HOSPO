import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Award, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import RoasterCard from "../components/roasters/RoasterCard";
import RoasterModal from "../components/roasters/RoasterModal";

export default function Roasters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoaster, setSelectedRoaster] = useState(null);

  const { data: roasters, isLoading } = useQuery({
    queryKey: ['roasters'],
    queryFn: () => base44.entities.Roaster.list('-average_rating'),
    initialData: [],
  });

  const filteredRoasters = roasters.filter(roaster =>
    roaster.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    roaster.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center shadow-2xl">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Roasters
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Discover and review Ireland's finest coffee roasters 🏆
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-amber-400" />
            <Input
              placeholder="Search roasters..."
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
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white relative overflow-hidden"
          >
            <div className="text-4xl font-bold mb-2">
              {filteredRoasters.length}
            </div>
            <div className="text-sm text-amber-100">Roasters</div>
            <Award className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-white relative overflow-hidden"
          >
            <div className="flex items-center gap-2 text-4xl font-bold mb-2">
              <Star className="w-8 h-8 fill-current" />
              {(roasters.reduce((sum, r) => sum + (r.average_rating || 0), 0) / (roasters.length || 1)).toFixed(1)}
            </div>
            <div className="text-sm text-yellow-100">Avg. Rating</div>
            <TrendingUp className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-orange-500 to-red-600 text-white col-span-2 md:col-span-1 relative overflow-hidden"
          >
            <div className="text-4xl font-bold mb-2">
              {roasters.reduce((sum, r) => sum + (r.total_reviews || 0), 0)}
            </div>
            <div className="text-sm text-orange-100">Total Reviews</div>
            <Star className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
          </motion.div>
        </div>

        {/* Roasters Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl animate-pulse bg-gradient-to-br from-amber-200 to-orange-200" />
            ))}
          </div>
        ) : filteredRoasters.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-white shadow-xl">
            <Award className="w-24 h-24 mx-auto mb-4 text-amber-300" />
            <h3 className="text-3xl font-bold mb-2 text-gray-900">
              No roasters found
            </h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoasters.map((roaster, index) => (
              <motion.div
                key={roaster.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RoasterCard roaster={roaster} onClick={() => setSelectedRoaster(roaster)} />
              </motion.div>
            ))}
          </div>
        )}

        {selectedRoaster && (
          <RoasterModal roaster={selectedRoaster} onClose={() => setSelectedRoaster(null)} />
        )}
      </div>
    </div>
  );
}