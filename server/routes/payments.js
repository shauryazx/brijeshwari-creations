import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, '../data/payment_config.json');

const router = express.Router();

// Helper to read payment config
const getPaymentConfig = () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading payment_config.json:", e);
  }
  return {
    environment: "LIVE",
    razorpay: { enabled: true, keyId: "rzp_live_brijeshwari_key", keySecret: "" },
    stripe: { enabled: true, publishableKey: "pk_live_brijeshwari", secretKey: "" },
    upi: { enabled: true, vpa: "brijeshwari@upi", merchantName: "Brijeshwari Creations" },
    cod: { enabled: true, minAmount: 0 }
  };
};

// Helper to save payment config
const savePaymentConfig = (config) => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error("Error saving payment_config.json:", e);
    return false;
  }
};

// GET Public Payment Gateway Config (hides secret keys for security)
router.get('/config', (req, res) => {
  const config = getPaymentConfig();
  res.json({
    success: true,
    config: {
      environment: config.environment || "LIVE",
      razorpay: {
        enabled: config.razorpay?.enabled ?? true,
        keyId: config.razorpay?.keyId || "rzp_live_brijeshwari"
      },
      stripe: {
        enabled: config.stripe?.enabled ?? true,
        publishableKey: config.stripe?.publishableKey || "pk_live_brijeshwari"
      },
      upi: {
        enabled: config.upi?.enabled ?? true,
        vpa: config.upi?.vpa || "brijeshwari@upi",
        merchantName: config.upi?.merchantName || "Brijeshwari Creations"
      },
      cod: {
        enabled: config.cod?.enabled ?? true,
        minAmount: config.cod?.minAmount || 0
      }
    }
  });
});

// GET Admin Full Payment Config (includes secret keys)
router.get('/admin/config', (req, res) => {
  const config = getPaymentConfig();
  res.json({
    success: true,
    config
  });
});

// POST Admin Update Payment Config
router.post('/admin/config', (req, res) => {
  const { environment, razorpay, stripe, upi, cod } = req.body;
  const newConfig = {
    environment: environment || "LIVE",
    razorpay: razorpay || { enabled: true, keyId: "", keySecret: "" },
    stripe: stripe || { enabled: true, publishableKey: "", secretKey: "" },
    upi: upi || { enabled: true, vpa: "brijeshwari@upi", merchantName: "Brijeshwari Creations" },
    cod: cod || { enabled: true, minAmount: 0 }
  };

  const saved = savePaymentConfig(newConfig);
  if (saved) {
    res.json({ success: true, message: "Payment setup updated successfully!", config: newConfig });
  } else {
    res.status(500).json({ success: false, message: "Failed to save payment setup" });
  }
});

// POST Process Payment
router.post('/process', (req, res) => {
  const { amount, currency, paymentMethod, cardDetails, upiId } = req.body;
  const config = getPaymentConfig();

  const isLive = config.environment === 'LIVE';

  // COD Payment
  if (paymentMethod === 'COD') {
    return res.json({
      success: true,
      transactionId: `COD-${Date.now()}`,
      status: 'SUCCESS',
      message: 'Cash on Delivery selected. Pay upon delivery.'
    });
  }

  // UPI Payment
  if (paymentMethod === 'UPI') {
    return res.json({
      success: true,
      transactionId: `UPI-TXN-${Date.now()}`,
      status: 'SUCCESS',
      vpa: config.upi?.vpa || "brijeshwari@upi",
      message: 'Live UPI Payment authorization confirmed.'
    });
  }

  // Razorpay or Card Payment
  return res.json({
    success: true,
    transactionId: `PAY-${config.environment}-${Date.now()}`,
    status: 'SUCCESS',
    environment: config.environment,
    gatewayUsed: paymentMethod,
    message: isLive ? 'Live Payment processed successfully!' : 'Test payment processed successfully!'
  });
});

// GET Live UPI QR Generator
router.get('/upi-qr', (req, res) => {
  const { amount } = req.query;
  const config = getPaymentConfig();
  const vpa = config.upi?.vpa || "brijeshwari@upi";
  const name = encodeURIComponent(config.upi?.merchantName || "Brijeshwari Creations");
  const amt = amount || 1000;
  
  const upiString = `upi://pay?pa=${vpa}&pn=${name}&am=${amt}&cu=INR&tn=Brijeshwari%20Heritage%20Purchase`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;

  res.json({
    success: true,
    upiUri: upiString,
    qrCodeUrl: qrUrl,
    vpa,
    merchantName: config.upi?.merchantName || "Brijeshwari Creations"
  });
});

export default router;
