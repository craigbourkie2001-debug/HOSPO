import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, ShoppingBag, Coffee, Wrench, Shirt, Package } from "lucide-react";
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
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-light mb-3 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Marketplace
          </h1>
          <p className="text-lg font-light tracking-wide" style={{ color: 'var(--clay)' }}>
            Premium coffee beans, equipment & merchandise
          </p>
        </div>

        <div className="mb-10">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-14 rounded-2xl border text-base"
              style={{ 
                borderColor: 'var(--sand)',
                backgroundColor: 'var(--warm-white)',
                color: 'var(--earth)'
              }}
            />
          </div>
        </div>

        <Tabs value={category} onValueChange={setCategory} className="mb-10">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 p-2 rounded-2xl h-auto" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
            <TabsTrigger 
              value="all" 
              className="rounded-xl py-3 font-normal tracking-wide data-[state=active]:text-white transition-all"
              style={{ 
                color: 'var(--clay)'
              }}
              data-active-style={{ backgroundColor: 'var(--terracotta)' }}
            >
              All Products
            </TabsTrigger>
            <TabsTrigger 
              value="coffee_beans" 
              className="rounded-xl py-3 font-normal tracking-wide data-[state=active]:text-white transition-all"
              style={{ color: 'var(--clay)' }}
            >
              <Coffee className="w-4 h-4 mr-2" style={{ strokeWidth: 1.5 }} />
              Beans
            </TabsTrigger>
            <TabsTrigger 
              value="brewing_equipment" 
              className="rounded-xl py-3 font-normal tracking-wide data-[state=active]:text-white transition-all"
              style={{ color: 'var(--clay)' }}
            >
              <Wrench className="w-4 h-4 mr-2" style={{ strokeWidth: 1.5 }} />
              Equipment
            </TabsTrigger>
            <TabsTrigger 
              value="merchandise" 
              className="rounded-xl py-3 font-normal tracking-wide data-[state=active]:text-white transition-all"
              style={{ color: 'var(--clay)' }}
            >
              <Shirt className="w-4 h-4 mr-2" style={{ strokeWidth: 1.5 }} />
              Merch
            </TabsTrigger>
            <TabsTrigger 
              value="subscription" 
              className="rounded-xl py-3 font-normal tracking-wide data-[state=active]:text-white transition-all"
              style={{ color: 'var(--clay)' }}
            >
              <Package className="w-4 h-4 mr-2" style={{ strokeWidth: 1.5 }} />
              Subscriptions
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          {['coffee_beans', 'brewing_equipment', 'merchandise', 'subscription'].map((cat, idx) => {
            const count = products.filter(p => p.category === cat).length;
            const Icon = categoryIcons[cat];
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl hover-lift"
                style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}
              >
                <Icon className="w-8 h-8 mb-3" style={{ color: 'var(--terracotta)', strokeWidth: 1.5 }} />
                <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>{count}</div>
                <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>{cat.replace(/_/g, ' ').toUpperCase()}</div>
              </motion.div>
            );
          })}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--sand)' }} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
            <ShoppingBag className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
            <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              No products found
            </h3>
            <p className="font-light" style={{ color: 'var(--clay)' }}>Try a different search or category</p>
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