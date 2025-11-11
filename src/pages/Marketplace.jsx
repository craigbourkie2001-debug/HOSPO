import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, ShoppingBag, Coffee, Wrench, Shirt, Star, Package } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "../components/marketplace/ProductCard";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ is_available: true }, '-created_date'),
    initialData: [],
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const categoryIcons = {
    coffee_beans: Coffee,
    brewing_equipment: Wrench,
    merchandise: Shirt,
    subscription: Package
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Marketplace
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Premium coffee beans, equipment & merch 🛍️
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-purple-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-16 rounded-3xl border-0 text-lg shadow-xl bg-white focus:shadow-2xl transition-all duration-300"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={category} onValueChange={setCategory} className="mb-8">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 p-2 rounded-3xl bg-white shadow-xl h-auto">
            <TabsTrigger value="all" className="rounded-2xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              All Products
            </TabsTrigger>
            <TabsTrigger value="coffee_beans" className="rounded-2xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Coffee className="w-4 h-4 mr-2" />
              Coffee Beans
            </TabsTrigger>
            <TabsTrigger value="brewing_equipment" className="rounded-2xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              <Wrench className="w-4 h-4 mr-2" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="merchandise" className="rounded-2xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
              <Shirt className="w-4 h-4 mr-2" />
              Merchandise
            </TabsTrigger>
            <TabsTrigger value="subscription" className="rounded-2xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Subscriptions
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['coffee_beans', 'brewing_equipment', 'merchandise', 'subscription'].map((cat, idx) => {
            const count = products.filter(p => p.category === cat).length;
            const Icon = categoryIcons[cat];
            const gradients = [
              'from-amber-500 to-orange-600',
              'from-blue-500 to-cyan-600',
              'from-pink-500 to-rose-600',
              'from-green-500 to-emerald-600'
            ];
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-3xl shadow-xl bg-gradient-to-br ${gradients[idx]} text-white relative overflow-hidden`}
              >
                <div className="text-4xl font-bold mb-2">{count}</div>
                <div className="text-sm text-white/90">{cat.replace(/_/g, ' ')}</div>
                <Icon className="w-12 h-12 absolute -right-2 -bottom-2 opacity-20" />
              </motion.div>
            );
          })}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl animate-pulse bg-gradient-to-br from-purple-200 to-pink-200" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-white shadow-xl">
            <ShoppingBag className="w-24 h-24 mx-auto mb-4 text-purple-300" />
            <h3 className="text-3xl font-bold mb-2 text-gray-900">
              No products found
            </h3>
            <p className="text-gray-600">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}