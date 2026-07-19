import React from 'react';

export const Footer = ({ onSelectCategory }) => {
  return (
    <footer className="bg-[#F7F4EE] border-t border-[#E5DEC9] text-[#231F20] pt-16 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 space-y-12">
        
        {/* Brand Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2 className="font-serif text-3xl font-extrabold tracking-wider text-[#231F20]">
            Brijeshwari Creations
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            Handcrafted Banarasi Sarees, Temple Brass Decor, Natural Scents, and Royal Accessories. Celebrating India's heritage craftsmanship.
          </p>
        </div>

        {/* Minimal Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left pt-6 border-t border-[#E5DEC9]">
          
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-[#C8963E]">Collections</h4>
            <ul className="space-y-1.5 text-xs text-stone-600">
              <li><button onClick={() => onSelectCategory('Clothing')} className="hover:text-[#E05638]">Terracotta Banarasi Sarees</button></li>
              <li><button onClick={() => onSelectCategory('Home Decor')} className="hover:text-[#E05638]">Temple Brass Diya Bowls</button></li>
              <li><button onClick={() => onSelectCategory('Fragrances')} className="hover:text-[#E05638]">Kannauj Pure Attar Fragrances</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-[#C8963E]">Craftsmanship</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Supporting over 500 hereditary artisan families across Varanasi, Jaipur, and Kannauj. Pure Silk Mark Certified.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-[#C8963E]">Concierge Helpline</h4>
            <p className="text-xs text-stone-600">📍 Chowk, Varanasi - 221001</p>
            <p className="text-xs font-bold text-[#231F20]">📞 +91 (0542) 240-8888</p>
            <p className="text-xs text-stone-600">✉️ concierge@brijeshwari.com</p>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-[#E5DEC9] text-center text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Brijeshwari Creations. All Rights Reserved.</p>
        </div>

      </div>
    </footer>
  );
};
