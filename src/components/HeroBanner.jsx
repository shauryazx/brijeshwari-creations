import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { fetchSiteConfig } from '../services/api';

export const HeroBanner = ({ onShopCategory }) => {
  const [heroData, setHeroData] = useState({
    tagline: 'KRAFT & HERITAGE',
    title: 'Banarasi Saree Collection',
    description: 'Terracotta Coral, deep warm charcoal, parchment cream, and heritage ochre gold.',
    buttonText: 'SHOP NOW',
    redirectTarget: 'Clothing',
    heroImage: '/images/saree_hero.jpg',
    urliImage: '/images/urli_center.jpg'
  });

  const loadSiteConfig = async () => {
    const res = await fetchSiteConfig();
    if (res && res.config && res.config.heroBanner) {
      setHeroData(res.config.heroBanner);
    }
  };

  useEffect(() => {
    loadSiteConfig();

    // 0ms INSTANT UPDATE LISTENER: Update banner image instantly when saved in Admin
    const handleInstantUpdate = (e) => {
      if (e.detail && e.detail.heroBanner) {
        setHeroData(e.detail.heroBanner);
      } else {
        loadSiteConfig();
      }
    };

    window.addEventListener('brijeshwari_site_config_updated', handleInstantUpdate);
    const pollInterval = setInterval(() => {
      loadSiteConfig();
    }, 2000);

    return () => {
      window.removeEventListener('brijeshwari_site_config_updated', handleInstantUpdate);
      clearInterval(pollInterval);
    };
  }, []);

  const handleHeroButtonClick = () => {
    const target = heroData.redirectTarget || 'Clothing';
    if (onShopCategory) {
      onShopCategory(target);
    }
  };

  return (
    <section className="relative w-full bg-[#F7F4EE] py-12 px-4 sm:px-8 lg:px-16 overflow-hidden select-none">
      
      {/* Background Indian Jali Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%20231F20' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: Banarasi Saree Model in Jali Frame */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-start">
          <div className="relative p-3 border border-[#E5DEC9] bg-[#FDFBF7] shadow-xl rounded-sm">
            <div className="absolute -inset-2 border border-[#D8CDB2] pointer-events-none -z-0" />
            <img
              src={heroData.heroImage || '/images/saree_hero.jpg'}
              alt="Banarasi Saree Model"
              className="w-full max-w-md h-[460px] sm:h-[520px] object-cover rounded-sm relative z-10 shadow-md"
            />
          </div>
        </div>

        {/* Center Overlapping Image: Floating Flowers in Brass Urli Bowl */}
        <div className="lg:col-span-3 relative z-20 -mt-12 lg:-mt-0 -ml-0 lg:-ml-16 flex justify-center">
          <div className="p-2 border-2 border-white bg-[#F7F4EE] shadow-2xl rounded-sm transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500">
            <img
              src={heroData.urliImage || '/images/urli_center.jpg'}
              alt="Brass Urli Diya Bowl"
              className="w-56 h-56 sm:w-64 sm:h-64 object-cover rounded-sm shadow-md"
            />
          </div>
        </div>

        {/* Right Side: Editorial Banner Typography */}
        <div className="lg:col-span-4 space-y-6 lg:pl-4 text-center lg:text-left z-10">
          
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold tracking-[0.3em] text-[#C8963E] uppercase block">
              {heroData.tagline || 'KRAFT & HERITAGE'}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#231F20] leading-tight tracking-tight">
              {heroData.title || 'Banarasi Saree Collection'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed max-w-sm mx-auto lg:mx-0 pt-2">
              {heroData.description || 'Terracotta Coral, deep warm charcoal, parchment cream, and heritage ochre gold.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleHeroButtonClick}
              className="inline-flex items-center gap-3 bg-[#E05638] hover:bg-[#c84529] text-white font-bold text-xs px-8 py-4 uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-xl hover:translate-x-1"
            >
              <span>{heroData.buttonText || 'SHOP NOW'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-[500px] border-l-2 border-t-2 border-[#E5DEC9] rounded-tl-full opacity-20 pointer-events-none hidden lg:block" />

    </section>
  );
};
