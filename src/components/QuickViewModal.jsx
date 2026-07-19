import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, Shield, Truck, RotateCcw, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const QuickViewModal = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, wishlist, formatPrice } = useCart();
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isWishlisted = wishlist.some(item => item.id === product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-brand-parchment rounded-3xl border border-brand-borderTerracotta shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-stone-700 rounded-full shadow-md transition-all"
        >
          <X size={20} />
        </button>

        {/* Product Images Column */}
        <div className="md:w-1/2 p-6 bg-brand-parchmentDark flex flex-col justify-between">
          <div className="relative w-full aspect-[4/3] md:aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-stone-200">
            <img
              src={product.images ? product.images[selectedImg] || product.images[0] : ''}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Selector */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImg === idx ? 'border-brand-terracotta scale-105' : 'border-stone-300 opacity-70'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Action Column */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-brand-terracotta">
              <span className="uppercase tracking-widest">{product.category} • {product.subcategory}</span>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check size={12} /> Stock Available ({product.stock})
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-brand-charcoal leading-snug">
              {product.name}
            </h2>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 text-sm text-amber-500 font-bold">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-brand-charcoal font-extrabold">{product.rating}</span>
              <span className="text-stone-400 font-normal">({product.reviewsCount} verified reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-extrabold text-brand-charcoal">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-stone-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed border-t border-b border-stone-200 py-3">
              {product.description}
            </p>

            {/* Product Specifications */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-400 block font-medium">Material</span>
                <span className="font-bold text-brand-charcoal">{product.material}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-400 block font-medium">Craft Origin</span>
                <span className="font-bold text-brand-charcoal">Handcrafted in India</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector & Add to Bag Actions */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white border border-stone-300 rounded-xl px-3 py-1.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="font-bold text-stone-600 px-2 py-1 text-base hover:text-brand-terracotta"
                >
                  -
                </button>
                <span className="font-extrabold text-sm px-4 text-brand-charcoal">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="font-bold text-stone-600 px-2 py-1 text-base hover:text-brand-terracotta"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  addToCart(product, quantity);
                  onClose();
                }}
                className="flex-1 bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag size={18} /> Add to Bag
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border border-stone-300 transition-all ${
                  isWishlisted ? 'bg-rose-50 text-brand-terracotta border-brand-terracotta' : 'bg-white hover:bg-stone-50'
                }`}
                title="Save to Wishlist"
              >
                <Heart size={20} className={isWishlisted ? "fill-brand-terracotta text-brand-terracotta" : ""} />
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-stone-500 font-semibold text-center border-t border-stone-200">
              <span className="flex items-center justify-center gap-1">
                <Shield size={12} className="text-brand-terracotta" /> 100% Authentic
              </span>
              <span className="flex items-center justify-center gap-1">
                <Truck size={12} className="text-brand-terracotta" /> Express Delivery
              </span>
              <span className="flex items-center justify-center gap-1">
                <RotateCcw size={12} className="text-brand-terracotta" /> Easy Returns
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
