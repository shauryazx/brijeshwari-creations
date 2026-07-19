import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { fetchSiteConfig } from '../services/api';

export const CategoryShowcase = ({ onSelectCategory }) => {
  const [sections, setSections] = useState([
    {
      id: 'sec-1',
      title: 'Terracotta Sarees',
      description: 'Authentic handwoven silk sarees with warm coral undertones and royal zari brocade.',
      image: '/images/saree_hero.jpg',
      buttonText: 'SHOP NOW',
      redirectTarget: 'Clothing'
    },
    {
      id: 'sec-2',
      title: 'Indians Terracotta Collections',
      description: 'Our finest handloom weaves and master artisan collections for royal heritage ceremonies.',
      image: '/images/saree_charcoal.jpg',
      buttonText: 'SHOP MORE',
      redirectTarget: 'Clothing'
    },
    {
      id: 'sec-3',
      title: 'Heritage Collections',
      description: 'Curated zari woven sarees and handcrafted parchment cream and heritage ochre gold creations.',
      image: '/images/saree_ochre.jpg',
      buttonText: 'SHOP NOW',
      redirectTarget: 'Clothing'
    }
  ]);

  const loadSiteConfig = async () => {
    const res = await fetchSiteConfig();
    if (res && res.config && res.config.sections) {
      // Handle array format or legacy object format gracefully
      if (Array.isArray(res.config.sections)) {
        setSections(res.config.sections);
      } else {
        const obj = res.config.sections;
        setSections([obj.section1, obj.section2, obj.section3].filter(Boolean));
      }
    }
  };

  useEffect(() => {
    loadSiteConfig();
    const pollInterval = setInterval(() => {
      loadSiteConfig();
    }, 2000);
    return () => clearInterval(pollInterval);
  }, []);

  const handleSectionButtonClick = (targetCategory) => {
    if (onSelectCategory) {
      onSelectCategory(targetCategory || 'Clothing');
    }
  };

  return (
    <section className="bg-[#F7F4EE] py-16 px-4 sm:px-8 lg:px-16 border-t border-[#E5DEC9] select-none">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {sections.map((sec, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <div key={sec.id || idx} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* IMAGE COLUMN */}
              <div className={`lg:col-span-7 relative flex justify-center ${isEven ? 'order-1' : 'order-1 lg:order-2'}`}>
                <div className="p-3 bg-white border border-[#E5DEC9] shadow-lg rounded-sm">
                  <img
                    src={sec.image || '/images/saree_hero.jpg'}
                    alt={sec.title}
                    className="w-full max-w-lg h-[420px] sm:h-[480px] object-cover rounded-sm"
                  />
                </div>
              </div>

              {/* EDITORIAL TEXT COLUMN */}
              <div className={`lg:col-span-5 space-y-4 text-center lg:text-left ${isEven ? 'order-2' : 'order-2 lg:order-1'}`}>
                <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C8963E] uppercase block">
                  HERITAGE FEATURE #{idx + 1}
                </span>

                <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#231F20]">
                  {sec.title}
                </h3>

                <p className="text-xs text-stone-600 max-w-sm mx-auto lg:mx-0 leading-relaxed">
                  {sec.description}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => handleSectionButtonClick(sec.redirectTarget)}
                    className="bg-[#E05638] hover:bg-[#c84529] text-white font-bold text-xs px-8 py-3.5 uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2 hover:translate-x-1"
                  >
                    <span>{sec.buttonText || 'SHOP NOW'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

      </div>
    </section>
  );
};
