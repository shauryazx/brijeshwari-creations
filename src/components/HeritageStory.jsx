import React from 'react';
import { Shield, Sparkles, Award, HeartHandshake, CheckCircle2, Truck, RefreshCw, Headphones } from 'lucide-react';

export const HeritageStory = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-brand-parchment to-brand-parchmentDark border-y border-brand-borderTerracotta/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Brand Promise Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-brand-terracotta bg-brand-terracottaLight px-3.5 py-1 rounded-full border border-brand-borderTerracotta">
              The Legacy of Brijeshwari
            </span>
            
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-charcoal leading-tight">
              Preserving Royal Indian Craftsmanship Since 1948
            </h2>
            
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Every creation at <strong>Brijeshwari Creations</strong> tells the story of hereditary master artisans — from the hand looms of Varanasi weaving pure silk and gold zari to temple sculptors casting solid brass in Jaipur and perfume masters distilling natural attars in Kannauj.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-2xl border border-brand-borderTerracotta/60 shadow-sm space-y-1">
                <h4 className="font-serif font-black text-2xl text-brand-terracotta">500+</h4>
                <p className="text-xs font-bold text-brand-charcoal">Artisan Families Supported</p>
                <p className="text-[10px] text-stone-500">Fair trade direct patronage</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-brand-borderTerracotta/60 shadow-sm space-y-1">
                <h4 className="font-serif font-black text-2xl text-brand-terracotta">100%</h4>
                <p className="text-xs font-bold text-brand-charcoal">Certified Silk Mark Pure</p>
                <p className="text-[10px] text-stone-500">Authentic zari brocade</p>
              </div>
            </div>
          </div>

          {/* Graphic Showcase Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-brand-gold/40 group">
            <img 
              src="/images/hero_decor.jpg" 
              alt="Brijeshwari Craftsmanship" 
              className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/90 via-brand-charcoal/40 to-transparent flex items-end p-8">
              <div className="text-white space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="text-brand-gold" size={24} />
                  <span className="font-serif font-bold text-lg text-brand-gold">Royal Patronage Assurance</span>
                </div>
                <p className="text-xs text-stone-200">
                  Each purchase arrives in a signature velvet-lined wooden keepsake box with a certificate of origin.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Icons Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-stone-200">
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
            <div className="p-3 bg-brand-terracottaLight text-brand-terracotta rounded-xl">
              <Truck size={22} />
            </div>
            <div>
              <h5 className="font-serif font-bold text-xs text-brand-charcoal">Express Shipping</h5>
              <span className="text-[10px] text-stone-500">Insured worldwide delivery</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Shield size={22} />
            </div>
            <div>
              <h5 className="font-serif font-bold text-xs text-brand-charcoal">Certified Genuine</h5>
              <span className="text-[10px] text-stone-500">100% authentic materials</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <RefreshCw size={22} />
            </div>
            <div>
              <h5 className="font-serif font-bold text-xs text-brand-charcoal">Easy Returns</h5>
              <span className="text-[10px] text-stone-500">Hassle-free 7 day policy</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Headphones size={22} />
            </div>
            <div>
              <h5 className="font-serif font-bold text-xs text-brand-charcoal">24/7 Phone Help</h5>
              <span className="text-[10px] text-stone-500">+91 (0542) 240-8888</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
