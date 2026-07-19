import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = ({ onProceedToCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotalINR,
    discountAmountINR,
    totalINR,
    freeShippingThreshold,
    freeShippingProgress,
    appliedPromo,
    applyPromoCode,
    formatPrice,
    totalItemsCount
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState(null);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput) return;
    const res = applyPromoCode(promoInput);
    setPromoStatus(res);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Dark Overlay Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-brand-parchment border-l border-brand-borderTerracotta shadow-2xl flex flex-col justify-between">
          
          {/* Cart Header */}
          <div className="p-6 border-b border-brand-borderTerracotta/60 flex items-center justify-between bg-brand-parchmentDark">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-brand-terracotta" size={22} />
              <h2 className="font-serif text-xl font-extrabold text-brand-charcoal">
                Your Shopping Bag ({totalItemsCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-stone-500 hover:text-brand-terracotta rounded-full hover:bg-stone-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-gradient-to-r from-brand-terracottaLight to-amber-50 p-4 border-b border-brand-borderTerracotta/40">
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-brand-charcoal flex items-center gap-1">
                <Sparkles size={14} className="text-brand-terracotta" /> Free Artisanal Shipping
              </span>
              <span className="text-brand-terracotta">
                {freeShippingProgress >= 100 
                  ? '🎉 Unlocked!' 
                  : `Add ${formatPrice(freeShippingThreshold - subtotalINR)} more`}
              </span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-terracotta transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-brand-parchmentDark rounded-full flex items-center justify-center mx-auto text-stone-400">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-charcoal">Your bag is currently empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore our luxury Banarasi sarees, temple decor, and artisanal scents to fill your bag.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-brand-terracotta text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md hover:bg-brand-terracottaDark transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.id}
                  className="flex gap-4 p-3 bg-white rounded-2xl border border-stone-200 shadow-sm relative group hover:border-brand-borderTerracotta transition-colors"
                >
                  <img
                    src={item.images ? item.images[0] : ''}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-xl bg-stone-100"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-bold text-brand-charcoal line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{item.subcategory || item.category}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-stone-200 rounded-lg px-2 py-0.5 bg-stone-50 text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="font-bold px-1.5 hover:text-brand-terracotta"
                        >
                          -
                        </button>
                        <span className="font-extrabold px-2 text-brand-charcoal">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="font-bold px-1.5 hover:text-brand-terracotta"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-sm text-brand-charcoal">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer Summary & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-brand-borderTerracotta/60 bg-brand-parchmentDark space-y-4">
              
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Promo Code (e.g. HERITAGE10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none uppercase font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand-charcoal text-white font-bold text-xs px-4 rounded-xl hover:bg-brand-charcoalLight transition-all"
                >
                  Apply
                </button>
              </form>

              {appliedPromo && (
                <div className="text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 p-2 rounded-xl flex items-center justify-between font-semibold">
                  <span>Promo Code applied: <strong>{appliedPromo}</strong></span>
                  <span>-{formatPrice(discountAmountINR)}</span>
                </div>
              )}

              {/* Subtotal Calculations */}
              <div className="space-y-1.5 text-xs text-stone-600 font-medium pt-2 border-t border-stone-200">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-bold text-brand-charcoal">{formatPrice(subtotalINR)}</span>
                </div>
                {discountAmountINR > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmountINR)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Artisanal Shipping</span>
                  <span className="text-emerald-700 font-bold">
                    {freeShippingProgress >= 100 ? 'FREE' : formatPrice(250)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-brand-charcoal pt-2 border-t border-stone-300">
                  <span>Total Payable</span>
                  <span className="text-brand-terracotta">
                    {formatPrice(totalINR + (freeShippingProgress >= 100 ? 0 : 250))}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  if (onProceedToCheckout) onProceedToCheckout();
                }}
                className="w-full bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-bold text-sm py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                <ShieldCheck size={13} className="text-brand-terracotta" /> Encrypted 256-Bit Custom Payment Gateway
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
