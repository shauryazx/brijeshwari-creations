import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, ArrowUpDown, Filter, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductGrid = ({ 
  products, 
  activeCategory, 
  activeSubcategory, 
  onSelectCategory,
  onQuickView,
  loading,
  searchValue,
  onResetFilters
}) => {
  const { formatPrice } = useCart();
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [priceRange, setPriceRange] = useState(40000);
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high', 'rating'
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const materials = ['All', 'Silk', 'Brass', 'Leather', 'Glass', 'Wood'];

  // Filter products locally for instant responsive UX
  let filtered = [...products];

  if (activeCategory && activeCategory !== 'All' && activeCategory !== 'Wishlist') {
    filtered = filtered.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
  }

  if (activeSubcategory) {
    filtered = filtered.filter(p => p.subcategory.toLowerCase() === activeSubcategory.toLowerCase());
  }

  if (selectedMaterial !== 'All') {
    filtered = filtered.filter(p => p.material.toLowerCase() === selectedMaterial.toLowerCase());
  }

  filtered = filtered.filter(p => p.price <= priceRange);

  if (searchValue) {
    const q = searchValue.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q)
    );
  }

  // Sort
  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Section Header & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-brand-borderTerracotta/50 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-brand-charcoal uppercase tracking-tight">
              {activeCategory === 'Wishlist' 
                ? 'Your Saved Wishlist' 
                : activeSubcategory 
                  ? activeSubcategory 
                  : activeCategory === 'All' 
                    ? 'All Lifestyle & Heritage Treasures' 
                    : `${activeCategory} Collection`}
            </h2>
            {activeSubcategory === 'Banarasi Sarees' && (
              <span className="bg-amber-700 text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Highlight Sub-category
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Showing <strong className="text-brand-terracotta">{filtered.length}</strong> authentic artisanal creations
          </p>
        </div>

        {/* Filter Controls & Sort Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className="flex items-center gap-2 bg-white border border-brand-borderTerracotta text-brand-charcoal hover:border-brand-terracotta font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <SlidersHorizontal size={16} className="text-brand-terracotta" />
            <span>Advanced Filters</span>
            {(selectedMaterial !== 'All' || priceRange < 40000) && (
              <span className="w-2 h-2 rounded-full bg-brand-terracotta"></span>
            )}
          </button>

          <div className="relative flex items-center bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs">
            <ArrowUpDown size={14} className="text-stone-400 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-semibold text-brand-charcoal focus:outline-none cursor-pointer pr-2"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expandable Advanced Filter Bar */}
      {showFilterDrawer && (
        <div className="mt-4 p-5 bg-brand-parchmentDark rounded-2xl border border-brand-borderTerracotta/60 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Material Filter */}
          <div>
            <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-2">
              Filter by Material
            </label>
            <div className="flex flex-wrap gap-1.5">
              {materials.map((mat) => (
                <button
                  key={mat}
                  onClick={() => setSelectedMaterial(mat)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedMaterial === mat
                      ? 'bg-brand-terracotta text-white font-bold shadow-sm'
                      : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                Max Price
              </label>
              <span className="text-xs font-extrabold text-brand-terracotta">
                {formatPrice(priceRange)}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="40000"
              step="1000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-brand-terracotta cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>₹1,000</span>
              <span>₹40,000+</span>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end justify-between sm:justify-end gap-3">
            <button
              onClick={() => {
                setSelectedMaterial('All');
                setPriceRange(40000);
                if (onResetFilters) onResetFilters();
              }}
              className="text-xs font-bold text-brand-terracotta hover:underline flex items-center gap-1.5 py-2"
            >
              <RefreshCw size={14} /> Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Product Grid Content */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-stone-600">Unveiling heritage treasures...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-stone-300 my-8 p-8 space-y-4">
          <AlertCircle size={40} className="mx-auto text-brand-terracotta/60" />
          <h3 className="font-serif text-xl font-bold text-brand-charcoal">No Products Found</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            We couldn't find any products matching your active filters. Try adjusting price range, material, or category.
          </p>
          <button
            onClick={() => {
              setSelectedMaterial('All');
              setPriceRange(40000);
              if (onResetFilters) onResetFilters();
            }}
            className="bg-brand-terracotta text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-brand-terracottaDark transition-all"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </section>
  );
};
