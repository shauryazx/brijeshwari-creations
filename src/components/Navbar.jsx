import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User, 
  ShieldCheck, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchCategories } from '../services/api';

export const Navbar = ({ onSelectCategory, activeCategory, onSearchChange, searchValue }) => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { user, isAdminUser, isAdminView, toggleAdminView, setIsAuthModalOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const loadCategories = async () => {
    const res = await fetchCategories();
    if (res && res.categories) {
      setCategoriesList(res.categories);
    }
  };

  useEffect(() => {
    loadCategories();
    const pollInterval = setInterval(() => {
      loadCategories();
    }, 2000);
    return () => clearInterval(pollInterval);
  }, [isAdminView]);

  const handleCategoryClick = (catName, subcat = null) => {
    if (onSelectCategory) {
      onSelectCategory(catName, subcat);
    }
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[#E5DEC9] transition-all duration-300">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Side: Clean Hamburger Menu */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#231F20] hover:text-[#E05638] transition-colors"
              title="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Quick Category Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-[#E05638] transition-colors"
              >
                <span>Categories</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#FDFBF7] border border-[#E5DEC9] shadow-xl rounded-sm p-3 z-50 animate-fadeIn space-y-1">
                  <button
                    onClick={() => handleCategoryClick('All')}
                    className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#231F20] hover:bg-[#F7F4EE] rounded-sm transition-all"
                  >
                    All Products
                  </button>
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.id || cat.name}
                      onClick={() => handleCategoryClick(cat.name)}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-[#F7F4EE] hover:text-[#E05638] rounded-sm transition-all block"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Brand Typography (Matches reference image) */}
          <div 
            className="cursor-pointer text-center"
            onClick={() => handleCategoryClick('All')}
          >
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-wider text-[#231F20]">
              Brijeshwari Creations
            </h1>
          </div>

          {/* Right Side: Search, Account & Bag Icons (Matches reference image) */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Search Toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-white border border-[#E05638] rounded-full px-3 py-1.5 shadow-sm">
                  <Search size={16} className="text-[#E05638] mr-2" />
                  <input
                    type="text"
                    placeholder="Search Sarees, Decor..."
                    value={searchValue || ''}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                    className="w-32 md:w-48 text-xs bg-transparent focus:outline-none"
                    autoFocus
                  />
                  <button onClick={() => setSearchOpen(false)} className="text-stone-400 hover:text-stone-600 ml-1">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-[#231F20] hover:text-[#E05638] transition-colors"
                  title="Search"
                >
                  <Search size={22} />
                </button>
              )}
            </div>

            {/* Customer Account Icon (Opens Profile & Order History) */}
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="p-2 text-[#231F20] hover:text-[#E05638] transition-colors"
              title={user ? `Account & Orders: ${user.name}` : "Sign In / Register"}
            >
              <User size={22} />
            </button>

            {/* Bag Counter (Matches reference image icon with pill counter) */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#231F20] hover:text-[#E05638] transition-colors flex items-center"
              title="Shopping Bag"
            >
              <ShoppingBag size={22} />
              <span className="absolute -top-1 -right-1 bg-[#E05638] text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                {totalItemsCount}
              </span>
            </button>

            {isAdminUser && (
              <button 
                onClick={toggleAdminView}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs font-bold transition-all shadow-sm ${
                  isAdminView 
                    ? 'bg-[#E05638] text-white' 
                    : 'bg-[#231F20] text-[#C8963E] hover:bg-stone-800'
                }`}
                title="Admin Control Dashboard"
              >
                <ShieldCheck size={14} /> {isAdminView ? 'Exit Admin' : 'Admin'}
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FDFBF7] border-b border-[#E5DEC9] p-4 space-y-3 animate-fadeIn">
          <button 
            onClick={() => handleCategoryClick('All')}
            className="block w-full text-left font-serif font-bold text-sm text-[#231F20] py-1 border-b border-stone-200"
          >
            ALL COLLECTIONS
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.id || cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="block w-full text-left text-xs font-semibold text-stone-700 hover:text-[#E05638] py-1"
            >
              • {cat.name}
            </button>
          ))}
          <div className="pt-2 border-t border-stone-200">
            <button 
              onClick={() => { setIsAuthModalOpen(true); setMobileMenuOpen(false); }}
              className="text-xs font-bold text-[#E05638] flex items-center gap-1.5"
            >
              <User size={14} /> Account & Track Orders
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
