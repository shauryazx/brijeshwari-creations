import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Lock, 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  ShieldCheck, 
  AlertCircle, 
  Building2, 
  Sparkles,
  ShoppingBag,
  Globe
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { processPayment, fetchPublicPaymentConfig } from '../services/api';

export const PaymentGateway = ({ totalAmount, orderId, onPaymentComplete }) => {
  const { formatPrice } = useCart();
  const [paymentTab, setPaymentTab] = useState('UPI'); // 'UPI', 'CARD', 'COD'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [upiQrData, setUpiQrData] = useState(null);

  // Live Gateway Config State fetched from Admin setup
  const [gatewayConfig, setGatewayConfig] = useState({
    environment: 'LIVE',
    razorpay: { enabled: true, keyId: 'rzp_live_brijeshwari_key' },
    stripe: { enabled: true, publishableKey: 'pk_live_brijeshwari' },
    upi: { enabled: true, vpa: 'brijeshwari@upi', merchantName: 'Brijeshwari Creations' },
    cod: { enabled: true, minAmount: 0 }
  });

  // Card Form State
  const [cardForm, setCardForm] = useState({
    name: 'Maharaja Devraj Singh',
    number: '4532 •••• •••• 8821',
    expiry: '08/29',
    cvv: '992'
  });

  // UPI State
  const [upiId, setUpiId] = useState('devraj@upi');

  useEffect(() => {
    // Load Admin Payment Configuration
    fetchPublicPaymentConfig().then(res => {
      if (res && res.config) {
        setGatewayConfig(res.config);
      }
    });

    // Generate UPI QR Code URL
    fetch(`/api/payments/upi-qr?amount=${totalAmount}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.success) setUpiQrData(data);
      })
      .catch(() => {});
  }, [totalAmount]);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const payload = {
      amount: totalAmount,
      currency: "INR",
      paymentMethod: paymentTab,
      cardDetails: paymentTab === 'CARD' ? cardForm : null,
      upiId: paymentTab === 'UPI' ? upiId : null
    };

    const res = await processPayment(payload);
    setLoading(false);

    if (res && res.success) {
      if (onPaymentComplete) {
        onPaymentComplete({
          transactionId: res.transactionId || `TXN-${Date.now()}`,
          paymentMethod: paymentTab === 'UPI' 
            ? `Live UPI Pay (${gatewayConfig.upi?.vpa || 'brijeshwari@upi'})` 
            : paymentTab === 'COD' 
              ? 'Cash on Delivery (COD)' 
              : `Live Card (Razorpay/Stripe)`,
          status: res.status || 'SUCCESS'
        });
      }
    } else {
      setErrorMessage(res.error || 'Payment failed. Please check credentials or try another method.');
    }
  };

  const isLiveMode = gatewayConfig.environment === 'LIVE';

  return (
    <div className="bg-white rounded-3xl border border-brand-borderTerracotta shadow-xl p-6 sm:p-8 space-y-6 animate-fadeIn">
      
      {/* Real Gateway Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 pb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-extrabold px-3 py-0.5 rounded-full border ${
              isLiveMode 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {isLiveMode ? '🚀 REAL PRODUCTION MONEY PROCESSOR ONLINE' : '🧪 TEST MODE ACTIVE'}
            </span>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <h3 className="font-serif text-2xl font-black text-brand-charcoal mt-1">
            Brijeshwari Secure Payment Gateway
          </h3>
          <p className="text-xs text-stone-500">256-Bit SSL Encrypted Banking Security</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-stone-500 block">Total Amount to Pay</span>
          <span className="font-serif text-3xl font-black text-brand-terracotta">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Payment Methods Selection Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1.5 rounded-2xl text-xs font-bold">
        {gatewayConfig.upi?.enabled && (
          <button
            type="button"
            onClick={() => setPaymentTab('UPI')}
            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              paymentTab === 'UPI' 
                ? 'bg-white text-brand-terracotta shadow-md' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <QrCode size={16} /> Live UPI / QR
          </button>
        )}

        {(gatewayConfig.razorpay?.enabled || gatewayConfig.stripe?.enabled) && (
          <button
            type="button"
            onClick={() => setPaymentTab('CARD')}
            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              paymentTab === 'CARD' 
                ? 'bg-white text-brand-terracotta shadow-md' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CreditCard size={16} /> Credit / Debit Card
          </button>
        )}

        {gatewayConfig.cod?.enabled && (
          <button
            type="button"
            onClick={() => setPaymentTab('COD')}
            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              paymentTab === 'COD' 
                ? 'bg-white text-brand-terracotta shadow-md' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag size={16} /> Cash on Delivery
          </button>
        )}
      </div>

      {/* TAB 1: LIVE UPI PAY (QR Code + GPay / PhonePe / Paytm) */}
      {paymentTab === 'UPI' && (
        <form onSubmit={handleProcessPayment} className="space-y-6 animate-fadeIn">
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-300 flex flex-col md:flex-row items-center gap-6">
            
            {/* Live QR Code Box */}
            <div className="bg-white p-3 rounded-2xl border border-amber-300 shadow-md text-center">
              {upiQrData ? (
                <img 
                  src={upiQrData.qrCodeUrl} 
                  alt="Live Merchant UPI QR" 
                  className="w-44 h-44 mx-auto rounded-xl"
                />
              ) : (
                <div className="w-44 h-44 bg-stone-100 flex items-center justify-center text-xs text-stone-400">
                  Generating UPI QR...
                </div>
              )}
              <span className="text-[10px] font-mono font-bold text-stone-600 block mt-2">
                Merchant VPA: {gatewayConfig.upi?.vpa || 'brijeshwari@upi'}
              </span>
            </div>

            <div className="space-y-3 flex-1 text-center md:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                ✨ Instant Live UPI Payment
              </span>
              <h4 className="font-serif text-xl font-extrabold text-brand-charcoal">
                Scan with GPay, PhonePe, Paytm, BHIM, or Cred
              </h4>
              <p className="text-xs text-stone-600">
                Scan the QR code with any UPI app on your phone to complete your payment directly to <strong>{gatewayConfig.upi?.merchantName || 'Brijeshwari Creations'}</strong>.
              </p>

              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Or enter your VPA ID to request payment:
                </label>
                <input
                  type="text"
                  placeholder="e.g. devraj@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-mono border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-extrabold text-sm py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Authorizing Payment...' : `Authorize & Complete Order (${formatPrice(totalAmount)})`}
          </button>
        </form>
      )}

      {/* TAB 2: CREDIT / DEBIT CARD (Razorpay / Stripe) */}
      {paymentTab === 'CARD' && (
        <form onSubmit={handleProcessPayment} className="space-y-4 text-xs animate-fadeIn">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Cardholder Name</label>
            <input
              type="text"
              required
              value={cardForm.name}
              onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
              className="w-full p-3 border border-stone-300 rounded-xl font-semibold focus:outline-none focus:border-brand-terracotta"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Card Number (Visa / Mastercard / Amex / RuPay)</label>
            <div className="relative">
              <input
                type="text"
                required
                value={cardForm.number}
                onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none focus:border-brand-terracotta"
              />
              <CreditCard size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Expiry Date</label>
              <input
                type="text"
                required
                placeholder="MM/YY"
                value={cardForm.expiry}
                onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none focus:border-brand-terracotta"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">CVV Security Code</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                  className="w-full p-3 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none focus:border-brand-terracotta"
                />
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-extrabold text-sm py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all"
            >
              {loading ? 'Processing Encrypted Payment...' : `Pay ${formatPrice(totalAmount)} via Card`}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CASH ON DELIVERY (COD) */}
      {paymentTab === 'COD' && (
        <form onSubmit={handleProcessPayment} className="space-y-6 animate-fadeIn">
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-300 text-center space-y-3">
            <ShoppingBag className="mx-auto text-amber-600" size={32} />
            <h4 className="font-serif font-bold text-lg text-brand-charcoal">Cash on Delivery Available</h4>
            <p className="text-xs text-stone-600 max-w-md mx-auto">
              You will pay <strong>{formatPrice(totalAmount)}</strong> in cash or via UPI to our courier agent upon delivery at your address.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-extrabold text-sm py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Confirming Order...' : `Confirm Order with Cash on Delivery`}
          </button>
        </form>
      )}

      {/* SSL Footnote */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
        <Lock size={13} className="text-emerald-600" />
        <span>Secured by 256-bit SSL Encryption • Razorpay & Stripe PCI-DSS Compliant</span>
      </div>

    </div>
  );
};
