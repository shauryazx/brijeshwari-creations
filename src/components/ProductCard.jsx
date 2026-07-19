import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product, onQuickView }) => {
  const { addToCart, toggleWishlist, wishlist, formatPrice } = useCart();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const isWishlisted = wishlist.some(item => item.id === product.id);

  // Dynamic aspect ratio styling
  const aspectClasses = {
    "3:4": "aspect-[3/4]",
    "1:1": "aspect-square",
    "4:3": "aspect-[4/3]"
  }[product.aspectRatio || "3:4"] || "aspect-[3/4]";

  return (
    <div className="group relative bg-white rounded-2xl border border-brand-borderTerracotta/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Image & Badges Container */}
      <div 
        className={`relative w-full ${aspectClasses} overflow-hidden bg-brand-parchmentDark cursor-pointer`}
        onMouseEnter={() => product.images?.length > 1 && setCurrentImgIndex(1)}
        onMouseLeave={() => setCurrentImgIndex(0)}
        onClick={() => onQuickView && onQuickView(product)}
      >
        <img
          src={product.images ? product.images[currentImgIndex] || product.images[0] : ''}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badge Overlay */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md text-white ${
              product.subcategory === 'Banarasi Sarees' ? 'bg-amber-700' : 'bg-brand-terracotta'
            }`}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full text-brand-charcoal hover:text-brand-terracotta shadow-md transition-transform active:scale-90"
          title="Save to Wishlist"
        >
          <Heart size={16} className={isWishlisted ? "fill-brand-terracotta text-brand-terracotta" : ""} />
        </button>

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-4 bottom-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView && onQuickView(product);
            }}
            className="w-full bg-brand-charcoal/90 hover:bg-brand-charcoal text-brand-parchment text-xs font-bold py-2.5 px-4 rounded-xl backdrop-blur-md flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Eye size={15} /> Quick View
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-semibold text-brand-terracotta">{product.subcategory || product.category}</span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star size={13} className="fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-stone-400 font-normal">({product.reviewsCount})</span>
            </div>
          </div>

          <h3 
            onClick={() => onQuickView && onQuickView(product)}
            className="font-serif text-base font-bold text-brand-charcoal group-hover:text-brand-terracotta transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.name}
          </h3>
          
          <p className="text-xs text-stone-500 line-clamp-1 mt-1">
            Material: <span className="font-medium text-stone-700">{product.material}</span>
          </p>
        </div>

        {/* Pricing & Add To Cart Button */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base text-brand-charcoal">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="bg-brand-terracotta/10 hover:bg-brand-terracotta text-brand-terracotta hover:text-white p-2.5 rounded-xl transition-all transform active:scale-95 flex items-center justify-center"
            title="Add to Shopping Bag"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
