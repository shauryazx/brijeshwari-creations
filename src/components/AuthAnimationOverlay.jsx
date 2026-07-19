import React from 'react';
import { Sparkles, CheckCircle2, Crown, LogOut, Heart, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthAnimationOverlay = () => {
  const { authAnimation } = useAuth();

  if (!authAnimation) return null;

  const { type, userName } = authAnimation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-brand-parchment rounded-3xl border-2 border-brand-gold shadow-2xl p-8 text-center space-y-5 animate-pop-in overflow-hidden">
        
        {/* Shimmering Golden Background Aura */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-300/30 rounded-full blur-2xl animate-pulse-glow" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-brand-terracotta/30 rounded-full blur-2xl animate-pulse-glow" />

        {/* Dynamic Icon & Animation based on Action */}
        {type === 'REGISTER' && (
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-terracotta to-amber-500 text-white flex items-center justify-center mx-auto shadow-xl animate-float-sparkle">
              <Crown size={42} />
            </div>
            <div className="absolute top-0 right-1/4 text-brand-gold animate-ping">
              <Sparkles size={20} />
            </div>
          </div>
        )}

        {type === 'LOGIN' && (
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl animate-pop-in">
              <CheckCircle2 size={44} />
            </div>
            <div className="absolute -bottom-1 left-1/3 text-amber-500 animate-bounce">
              <Sparkles size={22} />
            </div>
          </div>
        )}

        {type === 'LOGOUT' && (
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-stone-800 text-brand-gold flex items-center justify-center mx-auto shadow-xl animate-pop-in">
              <LogOut size={38} />
            </div>
          </div>
        )}

        {/* Text Content */}
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-brand-goldLight text-brand-gold border border-amber-300 inline-block shadow-sm">
            {type === 'REGISTER' ? '✨ Royal Patron Registration' : type === 'LOGIN' ? '🔓 Welcome Back' : '👋 Farewell'}
          </span>

          <h3 className="font-serif text-2xl font-black text-brand-charcoal leading-tight">
            {type === 'REGISTER' && `Welcome to Brijeshwari, ${userName}!`}
            {type === 'LOGIN' && `Good to see you, ${userName}!`}
            {type === 'LOGOUT' && `See You Soon, ${userName}!`}
          </h3>

          <p className="text-xs text-stone-600 leading-relaxed font-medium">
            {type === 'REGISTER' && 'Your heritage account has been created. Enjoy complimentary express delivery across all Banarasi & temple collections.'}
            {type === 'LOGIN' && 'Your saved wishlist and custom order history are ready.'}
            {type === 'LOGOUT' && 'You have successfully signed out of your account. We look forward to serving your royal taste again soon.'}
          </p>
        </div>

        {/* Decorative Golden Line */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-brand-gold" />
          <Heart size={14} className="text-brand-terracotta fill-brand-terracotta animate-pulse" />
          <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-brand-gold" />
        </div>

      </div>
    </div>
  );
};
