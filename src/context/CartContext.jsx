import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currency, setCurrency] = useState('INR'); // 'INR' or 'USD'
  const [exchangeRate] = useState(0.012); // 1 INR = 0.012 USD
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Add to cart with safe fallback
  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    const safeProduct = {
      ...product,
      price: Number(product.price || 0),
      originalPrice: Number(product.originalPrice || product.price || 0),
      images: product.images && product.images.length > 0 ? product.images : [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
      ]
    };

    setCart((prevCart) => {
      const existing = prevCart.find(item => item.id === safeProduct.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === safeProduct.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...safeProduct, quantity }];
    });
    showToast(`Added "${safeProduct.name}" to bag`);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    setDiscountPercent(0);
  };

  const toggleWishlist = (product) => {
    if (!product) return;
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        showToast(`Removed from wishlist`);
        return prev.filter(item => item.id !== product.id);
      } else {
        showToast(`Saved "${product.name}" to wishlist`);
        return [...prev, product];
      }
    });
  };

  const applyPromoCode = (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (cleanCode === 'HERITAGE10') {
      setAppliedPromo('HERITAGE10');
      setDiscountPercent(10);
      showToast('Applied 10% Heritage Discount!');
      return { success: true, message: '10% discount applied!' };
    } else if (cleanCode === 'BANARASI20') {
      setAppliedPromo('BANARASI20');
      setDiscountPercent(20);
      showToast('Applied 20% Banarasi Silk Discount!');
      return { success: true, message: '20% Banarasi discount applied!' };
    } else {
      showToast('Invalid promo code');
      return { success: false, message: 'Invalid promo code' };
    }
  };

  const formatPrice = (priceInINR) => {
    const numericPrice = Number(priceInINR || 0);
    if (currency === 'USD') {
      const usdPrice = numericPrice * exchangeRate;
      return `$${usdPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₹${numericPrice.toLocaleString('en-IN')}`;
  };

  // Safe subtotal calculation
  const subtotalINR = cart.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const discountAmountINR = (subtotalINR * discountPercent) / 100;
  const totalINR = Math.max(0, subtotalINR - discountAmountINR);
  const totalItemsCount = cart.reduce((acc, item) => acc + Number(item.quantity || 1), 0);

  const freeShippingThreshold = 5000;
  const freeShippingProgress = Math.min(100, (subtotalINR / freeShippingThreshold) * 100);

  return (
    <CartContext.Provider value={{
      cart,
      wishlist,
      isCartOpen,
      setIsCartOpen,
      currency,
      setCurrency,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      appliedPromo,
      discountPercent,
      applyPromoCode,
      formatPrice,
      subtotalINR,
      discountAmountINR,
      totalINR,
      totalItemsCount,
      freeShippingThreshold,
      freeShippingProgress,
      toastMessage
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
