import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  XCircle, 
  PhoneCall, 
  Headphones,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchAdminOrders } from '../services/api';

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, user, logout } = useAuth();
  const { formatPrice } = useCart();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('maharaja@brijeshwari.com');
  const [password, setPassword] = useState('••••••••');

  const loadUserOrders = async () => {
    if (!user) return;
    const res = await fetchAdminOrders();
    if (res && res.orders) {
      const myOrders = res.orders.filter(o => 
        o.customer?.email?.toLowerCase() === user.email.toLowerCase() ||
        o.customer?.fullName?.toLowerCase() === user.name.toLowerCase()
      );
      setUserOrders(myOrders.length > 0 ? myOrders : res.orders);
    }
    setLoadingOrders(false);
  };

  // REAL-TIME POLLING: Poll order status changes every 2 seconds when modal is open
  useEffect(() => {
    if (isAuthModalOpen && user) {
      setLoadingOrders(true);
      loadUserOrders();

      const pollInterval = setInterval(() => {
        loadUserOrders();
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [isAuthModalOpen, user]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegisterMode) {
      if (!fullName) return;
      register(fullName, email, password);
    } else {
      login(email, password);
    }
  };

  // Step Calculation Logic
  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'declined' || s.includes('cancel')) return -1;
    if (s === 'delivered') return 3;
    if (s === 'shipped') return 2;
    if (s === 'accepted') return 1;
    return 0; // 'Processing' / initial state = Step 0 (Order Placed & Awaiting Admin Approval)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-brand-parchment rounded-3xl border border-brand-borderTerracotta shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 text-stone-400 hover:text-brand-terracotta p-1 transition-colors z-20"
        >
          <X size={20} />
        </button>

        {/* User Logged-In Profile & Real-Time Order Tracking View */}
        {user ? (
          <div className="flex-1 overflow-y-auto space-y-6">
            
            {/* User Profile Header */}
            <div className="p-5 bg-white rounded-2xl border border-brand-borderTerracotta/60 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-terracotta text-white flex items-center justify-center font-serif text-xl font-bold shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-terracotta bg-brand-terracottaLight px-2 py-0.5 rounded-full">
                    Authenticated Patron Profile
                  </span>
                  <h3 className="font-serif font-extrabold text-xl text-brand-charcoal">{user.name}</h3>
                  <p className="text-xs text-stone-500">{user.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                title="Sign Out"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>

            {/* Customer Care Helpline Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Headphones className="text-brand-terracotta" size={20} />
                <div>
                  <span className="font-bold text-brand-charcoal block">Royal Concierge Support</span>
                  <span className="text-stone-600 text-[11px]">Questions about your order? Call us anytime.</span>
                </div>
              </div>
              <a
                href="tel:+9105422408888"
                className="bg-brand-terracotta text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl shadow-sm hover:bg-brand-terracottaDark flex items-center gap-1"
              >
                <PhoneCall size={13} /> Call Support
              </a>
            </div>

            {/* Orders & Real-time Live Tracking List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2 border-stone-200">
                <h4 className="font-serif font-bold text-lg text-brand-charcoal flex items-center gap-2">
                  <Package className="text-brand-terracotta" size={20} />
                  Your Orders & Live Real-Time Tracking
                </h4>
                <span className="text-xs text-stone-500 font-semibold">{userOrders.length} Orders Found</span>
              </div>

              {loadingOrders ? (
                <div className="text-center py-8 text-stone-500 text-xs">Loading live order history...</div>
              ) : userOrders.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-dashed text-center text-stone-400 text-xs italic">
                  You haven't placed any orders yet.
                </div>
              ) : (
                userOrders.map((ord) => {
                  const stepIndex = getStepIndex(ord.orderStatus);

                  return (
                    <div key={ord.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-2">
                        <div>
                          <span className="font-mono font-bold text-brand-terracotta text-sm">{ord.id}</span>
                          <span className="text-xs text-stone-500 ml-2">Placed on {new Date(ord.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-serif font-bold text-base text-brand-charcoal">{formatPrice(ord.totalAmount)}</span>
                          <span className="text-[10px] text-stone-400 block">Paid via {ord.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Visual Delivery Progress Bar */}
                      {stepIndex === -1 ? (
                        <div className="p-3.5 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl text-xs font-bold flex items-center gap-2">
                          <XCircle size={18} className="text-rose-600" />
                          <div>
                            <span>Order Status: Declined by Store</span>
                            <p className="font-normal text-[11px] text-rose-700 mt-0.5">This order was declined. Call support (+91 0542 240-8888) for refund or replacement.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                            Current Delivery Progress (Live Real-Time)
                          </span>
                          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                            
                            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                              stepIndex >= 0 ? 'bg-brand-terracottaLight border-brand-borderTerracotta text-brand-terracotta font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'
                            }`}>
                              <Clock size={14} />
                              <span>1. Placed</span>
                              <span className="text-[9px] font-normal text-stone-500">Awaiting Admin</span>
                            </div>

                            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                              stepIndex >= 1 ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'
                            }`}>
                              <PackageCheck size={14} />
                              <span>2. Accepted</span>
                              <span className="text-[9px] font-normal text-stone-500">Artisan Packing</span>
                            </div>

                            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                              stepIndex >= 2 ? 'bg-brand-terracottaLight border-brand-borderTerracotta text-brand-terracotta font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'
                            }`}>
                              <Truck size={14} />
                              <span>3. In Transit</span>
                              <span className="text-[9px] font-normal text-stone-500">Express Air</span>
                            </div>

                            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                              stepIndex >= 3 ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'
                            }`}>
                              <CheckCircle2 size={14} />
                              <span>4. Delivered</span>
                              <span className="text-[9px] font-normal text-stone-500">Completed</span>
                            </div>

                          </div>
                        </div>
                      )}

                      {/* Items List */}
                      <div className="space-y-1 text-xs pt-1">
                        {ord.items?.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-stone-700">
                            <span>{it.name} (x{it.quantity})</span>
                            <span className="font-semibold">{formatPrice(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        ) : (
          /* Form for Login / Register */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-brand-terracotta text-white flex items-center justify-center mx-auto text-xl font-serif font-bold shadow-md">
                B
              </div>
              <h3 className="font-serif text-2xl font-extrabold text-brand-charcoal">
                {isRegisterMode ? 'Join Brijeshwari Patronage' : 'Sign In to View Your Orders'}
              </h3>
              <p className="text-xs text-stone-500">
                {isRegisterMode 
                  ? 'Create an account to track custom orders & earn heritage rewards' 
                  : 'Sign in to view all your order history & real-time delivery tracking'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  !isRegisterMode ? 'bg-white text-brand-terracotta shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  isRegisterMode ? 'bg-white text-brand-terracotta shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegisterMode && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required={isRegisterMode}
                      placeholder="e.g. Maharani Gayatri Devi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                    />
                    <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="maharaja@brijeshwari.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                  />
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                  />
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-bold text-xs py-3.5 rounded-2xl shadow-lg transition-all"
              >
                {isRegisterMode ? 'Register & View Orders' : 'Sign In & View Orders'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs text-stone-500 hover:text-brand-terracotta underline font-medium"
                >
                  {isRegisterMode 
                    ? 'Already have an account? Sign In' 
                    : "Don't have an account? Register now"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
