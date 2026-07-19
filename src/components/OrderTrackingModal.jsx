import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  Mail, 
  MessageSquare, 
  MapPin, 
  AlertCircle, 
  Send,
  PackageCheck,
  XCircle,
  Headphones
} from 'lucide-react';
import { fetchAdminOrders } from '../services/api';
import { useCart } from '../context/CartContext';

export const OrderTrackingModal = ({ isOpen, onClose }) => {
  const { formatPrice } = useCart();
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Support inquiry ticket state
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  if (!isOpen) return null;

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    if (!searchOrderId) return;

    setLoading(true);
    setErrorMsg(null);
    setSearchedOrder(null);

    const res = await fetchAdminOrders();
    setLoading(false);

    if (res && res.orders) {
      const found = res.orders.find(o => 
        o.id.toLowerCase().trim() === searchOrderId.toLowerCase().trim() ||
        o.id.replaceAll('-', '').toLowerCase().includes(searchOrderId.toLowerCase().trim())
      );

      if (found) {
        setSearchedOrder(found);
      } else {
        setErrorMsg(`No order found matching "${searchOrderId}". Please check your order ID from your receipt.`);
      }
    } else {
      setErrorMsg("Unable to retrieve order tracking at this time.");
    }
  };

  const handleSendSupport = (e) => {
    e.preventDefault();
    if (!supportMessage) return;
    setSupportSent(true);
    setTimeout(() => {
      setSupportMessage('');
      setSupportSent(false);
    }, 4000);
  };

  // Timeline Step calculation
  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('declined') || s.includes('cancelled')) return -1;
    if (s.includes('delivered')) return 3;
    if (s.includes('shipped')) return 2;
    if (s.includes('accepted') || s.includes('processing')) return 1;
    return 0; // Order Placed
  };

  const currentStep = searchedOrder ? getStepIndex(searchedOrder.orderStatus) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-brand-parchment rounded-3xl border border-brand-borderTerracotta shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-brand-parchmentDark border-b border-brand-borderTerracotta/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-terracotta text-white rounded-xl shadow-md">
              <Truck size={22} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-extrabold text-brand-charcoal">
                Track Order & Live Customer Care
              </h2>
              <p className="text-xs text-stone-500">Real-time delivery progress & instant phone support</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-brand-terracotta rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-8">
          
          {/* Order Search Bar */}
          <form onSubmit={handleSearchOrder} className="space-y-2">
            <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider">
              Enter Your Order ID
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. BC-ORD-8821"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-xs font-mono font-bold border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-brand-terracotta uppercase"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-bold text-xs px-6 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                {loading ? 'Searching...' : 'Track Package'}
              </button>
            </div>
          </form>

          {/* Search Error Alert */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-3">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Searched Order Details & Timeline */}
          {searchedOrder && (
            <div className="bg-white p-6 rounded-3xl border border-brand-borderTerracotta/60 shadow-sm space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-terracotta bg-brand-terracottaLight px-2.5 py-1 rounded-full">
                    Order Found
                  </span>
                  <h3 className="font-serif font-black text-2xl text-brand-charcoal mt-1">
                    {searchedOrder.id}
                  </h3>
                  <span className="text-xs text-stone-500">Placed on {new Date(searchedOrder.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500 block">Total Amount</span>
                  <span className="font-serif text-2xl font-black text-brand-terracotta">
                    {formatPrice(searchedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* 4-Step Order Visual Progress Timeline */}
              {currentStep === -1 ? (
                <div className="p-4 bg-rose-100 border border-rose-300 text-rose-900 rounded-2xl text-xs flex items-center gap-3 font-bold">
                  <XCircle size={24} className="text-rose-600" />
                  <div>
                    <span>Order Status: Declined / Cancelled by Store</span>
                    <p className="font-normal text-[11px] text-rose-700 mt-0.5">Please contact customer support below for refund or replacement.</p>
                  </div>
                </div>
              ) : (
                <div className="py-3">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-4">
                    Delivery Status Timeline
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center relative">
                    
                    {/* Connecting Line */}
                    <div className="absolute top-5 left-1/8 right-1/8 h-1 bg-stone-200 -z-0" />

                    {/* Step 1: Placed */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                        currentStep >= 0 ? 'bg-brand-terracotta text-white' : 'bg-stone-200 text-stone-500'
                      }`}>
                        <Clock size={18} />
                      </div>
                      <span className="text-xs font-bold text-stone-800">Order Placed</span>
                      <span className="text-[10px] text-stone-400">Received</span>
                    </div>

                    {/* Step 2: Accepted / Processing */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                        currentStep >= 1 ? 'bg-brand-terracotta text-white' : 'bg-stone-200 text-stone-500'
                      }`}>
                        <PackageCheck size={18} />
                      </div>
                      <span className="text-xs font-bold text-stone-800">Accepted</span>
                      <span className="text-[10px] text-stone-400">Artisan Packing</span>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                        currentStep >= 2 ? 'bg-brand-terracotta text-white' : 'bg-stone-200 text-stone-500'
                      }`}>
                        <Truck size={18} />
                      </div>
                      <span className="text-xs font-bold text-stone-800">In Transit</span>
                      <span className="text-[10px] text-stone-400">Express Air</span>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                        currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                      }`}>
                        <CheckCircle2 size={18} />
                      </div>
                      <span className="text-xs font-bold text-stone-800">Delivered</span>
                      <span className="text-[10px] text-stone-400">Completed</span>
                    </div>

                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-2 pt-3 border-t border-stone-200">
                <span className="text-xs font-bold text-stone-600 uppercase">Items in Shipment:</span>
                <div className="space-y-1.5 text-xs">
                  {searchedOrder.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="font-semibold text-stone-800">{it.name} (x{it.quantity})</span>
                      <span className="font-bold">{formatPrice(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* CUSTOMER CARE & SUPPORT SECTION */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-300/80 space-y-6">
            
            <div className="flex items-center gap-3 border-b border-amber-200 pb-3">
              <Headphones className="text-brand-terracotta" size={26} />
              <div>
                <h3 className="font-serif font-bold text-lg text-brand-charcoal">
                  Direct Royal Concierge & Phone Support
                </h3>
                <p className="text-xs text-stone-600">Have a question or problem with your order? Our support team is here 24/7.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Phone Call Support Card */}
              <a 
                href="tel:+9105422408888" 
                className="bg-white p-4 rounded-2xl border border-amber-200 flex items-center gap-4 hover:border-brand-terracotta transition-all shadow-sm group"
              >
                <div className="p-3 bg-brand-terracotta text-white rounded-xl group-hover:scale-110 transition-transform">
                  <PhoneCall size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase">24/7 Phone Support</span>
                  <h4 className="font-extrabold text-sm text-brand-charcoal">+91 (0542) 240-8888</h4>
                  <span className="text-xs text-brand-terracotta font-semibold">Click to Call Now</span>
                </div>
              </a>

              {/* Email Support Card */}
              <a 
                href="mailto:concierge@brijeshwari.com" 
                className="bg-white p-4 rounded-2xl border border-amber-200 flex items-center gap-4 hover:border-brand-terracotta transition-all shadow-sm group"
              >
                <div className="p-3 bg-brand-charcoal text-brand-gold rounded-xl group-hover:scale-110 transition-transform">
                  <Mail size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Email Assistance</span>
                  <h4 className="font-extrabold text-xs text-brand-charcoal">concierge@brijeshwari.com</h4>
                  <span className="text-xs text-brand-terracotta font-semibold">Send Direct Email</span>
                </div>
              </a>

            </div>

            {/* Quick Ticket Inquiry Form */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-brand-charcoal uppercase tracking-wider block">
                Submit Support Message / Ticket
              </span>

              {supportSent ? (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Your support ticket has been received! Our concierge will call or email you shortly.</span>
                </div>
              ) : (
                <form onSubmit={handleSendSupport} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Describe your question or issue..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                  />
                  <button
                    type="submit"
                    className="bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-bold text-xs px-5 rounded-xl flex items-center gap-1.5"
                  >
                    <Send size={14} /> Send
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
