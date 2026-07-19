import express from 'express';
import cors from 'cors';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import paymentsRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for computer image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    brand: 'Brijeshwari Creations',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/site-config', adminRoutes);

app.listen(PORT, () => {
  console.log(`✨ Brijeshwari Creations Express Server running on http://localhost:${PORT}`);
});
