import express from 'express';
const router = express.Router();

// In-memory orders store
let ordersStore = [];

// GET all orders
router.get('/', (req, res) => {
  res.json({
    success: true,
    total: ordersStore.length,
    orders: ordersStore
  });
});

// GET order by ID
router.get('/:id', (req, res) => {
  const order = ordersStore.find(o => 
    o.id.toLowerCase() === req.params.id.toLowerCase()
  );
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, order });
});

// POST create new order
router.post('/', (req, res) => {
  const { customer, items, totalAmount, currency, paymentMethod, transactionId } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ success: false, message: 'Cart items are required' });
  }

  const newOrder = {
    id: `BC-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: customer || { fullName: "Guest Customer", email: "guest@brijeshwari.com" },
    items: items,
    totalAmount: totalAmount || 0,
    currency: currency || "INR",
    paymentStatus: "Completed",
    paymentMethod: paymentMethod || "Custom Payment Gateway Scaffold",
    transactionId: transactionId || `TXN-${Date.now()}`,
    orderStatus: "Processing", // Pending Admin Acceptance/Decline
    createdAt: new Date().toISOString()
  };

  ordersStore.unshift(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

// PUT update order status (Admin Accept / Decline / Ship)
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const order = ordersStore.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.orderStatus = status || order.orderStatus;
  res.json({ success: true, order });
});

export default router;
