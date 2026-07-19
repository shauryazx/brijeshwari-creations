import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryShowcase } from './components/CategoryShowcase';
import { ProductGrid } from './components/ProductGrid';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { AuthAnimationOverlay } from './components/AuthAnimationOverlay';
import { HeritageStory } from './components/HeritageStory';
import { Footer } from './components/Footer';
import { fetchProducts } from './services/api';
import { CheckCircle2 } from 'lucide-react';

const MainAppContent = () => {
  const { toastMessage } = useCart();
  const { isAdminView, toggleAdminView } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const loadProducts = async () => {
    const data = await fetchProducts();
    if (data && data.products) {
      setProducts(data.products);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();

    // REAL-TIME POLLING: Poll products every 2 seconds for instant live updates across storefront
    const pollInterval = setInterval(() => {
      loadProducts();
    }, 2000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleSelectCategory = (catName, subcat = null) => {
    setActiveCategory(catName);
    setActiveSubcategory(subcat);
  };

  const handleResetFilters = () => {
    setActiveCategory('All');
    setActiveSubcategory(null);
    setSearchValue('');
  };

  return (
    <div className="min-h-screen bg-brand-parchment text-brand-charcoal font-sans flex flex-col justify-between">
      
      {/* Auth Animation Overlay */}
      <AuthAnimationOverlay />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-charcoal text-brand-parchment px-5 py-3 rounded-2xl shadow-2xl border border-brand-gold flex items-center gap-3 animate-fadeIn text-xs font-bold">
          <CheckCircle2 size={18} className="text-brand-terracotta" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Customer Account & Live Order Tracking Modal */}
      <AuthModal />

      {/* Render: Admin Panel OR Customer Storefront */}
      {isAdminView ? (
        <AdminPanel onBackToStore={toggleAdminView} />
      ) : (
        <>
          <Navbar
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
          />

          {activeCategory === 'All' && !activeSubcategory && !searchValue && (
            <>
              <HeroBanner onShopCategory={handleSelectCategory} />
              <CategoryShowcase onSelectCategory={handleSelectCategory} />
            </>
          )}

          <main className="flex-1">
            <ProductGrid
              products={products}
              activeCategory={activeCategory}
              activeSubcategory={activeSubcategory}
              onSelectCategory={handleSelectCategory}
              onQuickView={(p) => setQuickViewProduct(p)}
              loading={loading}
              searchValue={searchValue}
              onResetFilters={handleResetFilters}
            />
          </main>

          {activeCategory === 'All' && !activeSubcategory && !searchValue && (
            <HeritageStory />
          )}

          {quickViewProduct && (
            <QuickViewModal
              product={quickViewProduct}
              onClose={() => setQuickViewProduct(null)}
            />
          )}

          <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
          />

          <Footer
            onSelectCategory={handleSelectCategory}
          />
        </>
      )}

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
