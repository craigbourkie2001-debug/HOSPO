import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Award, Star } from "lucide-react";
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
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--warm-white)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8" style={{ color: 'var(--coffee-brown)' }} />
            <h1 className="text-4xl font-bold" style={{ color: 'var(--espresso)' }}>
              Roasters
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--coffee-brown)' }}>
            Discover and review Ireland's finest coffee roasters
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--coffee-brown)' }} />
            <Input
              placeholder="Search roasters..."
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
              {filteredRoasters.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Roasters</div>
          </div>
          <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center gap-2 text-3xl font-bold mb-1" style={{ color: 'var(--fresh-green)' }}>
              <Star className="w-6 h-6 fill-current" />
              {(roasters.reduce((sum, r) => sum + (r.average_rating || 0), 0) / (roasters.length || 1)).toFixed(1)}
            </div>
            <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Avg. Rating</div>
          </div>
          <div className="p-4 rounded-2xl shadow-sm col-span-2 md:col-span-1" style={{ backgroundColor: 'white' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--espresso)' }}>
              {roasters.reduce((sum, r) => sum + (r.total_reviews || 0), 0)}
            </div>
            <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Total Reviews</div>
          </div>
        </div>

        {/* Roasters Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--latte)' }} />
            ))}
          </div>
        ) : filteredRoasters.length === 0 ? (
          <div className="text-center py-20">
            <Award className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--latte)' }} />
            <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--espresso)' }}>
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