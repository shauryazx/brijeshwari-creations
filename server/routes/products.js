import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/products.json');

// Helper to read products
const getProductsData = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading products JSON:", err);
    return [];
  }
};

// Helper to save products
const saveProductsData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing products JSON:", err);
    return false;
  }
};

// GET all products with filtering, search, sorting
router.get('/', (req, res) => {
  let products = getProductsData();
  const { category, subcategory, material, minPrice, maxPrice, search, sort, isFeatured } = req.query;

  if (category) {
    products = products.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
  }

  if (subcategory) {
    products = products.filter(p => (p.subcategory || '').toLowerCase() === subcategory.toLowerCase());
  }

  if (material) {
    products = products.filter(p => (p.material || '').toLowerCase() === material.toLowerCase());
  }

  if (minPrice) {
    products = products.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    products = products.filter(p => p.price <= Number(maxPrice));
  }

  if (isFeatured === 'true') {
    products = products.filter(p => p.isFeatured === true);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => 
      (p.name || '').toLowerCase().includes(q) || 
      (p.description || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.subcategory || '').toLowerCase().includes(q)
    );
  }

  if (sort) {
    if (sort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }
  }

  res.json({
    success: true,
    total: products.length,
    products
  });
});

// GET product by ID
router.get('/:id', (req, res) => {
  const products = getProductsData();
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

// POST create product (Admin)
router.post('/', (req, res) => {
  const products = getProductsData();
  const newProduct = {
    id: `prod-${Date.now()}`,
    name: req.body.name || 'New Heritage Item',
    category: req.body.category || 'Clothing',
    subcategory: req.body.subcategory || 'Banarasi Sarees',
    price: Number(req.body.price) || 9999,
    originalPrice: Number(req.body.originalPrice) || 12999,
    rating: 5.0,
    reviewsCount: 1,
    material: req.body.material || 'Silk',
    aspectRatio: req.body.aspectRatio || '3:4',
    badge: req.body.badge || 'New Arrival',
    stock: Number(req.body.stock) || 10,
    isFeatured: req.body.isFeatured || false,
    images: (req.body.images && req.body.images.length > 0) ? req.body.images : [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
    ],
    description: req.body.description || 'Authentic handcrafted heritage item from Brijeshwari Creations.'
  };

  products.unshift(newProduct);
  saveProductsData(products);
  res.status(201).json({ success: true, product: newProduct });
});

// PUT update product (Admin)
router.put('/:id', (req, res) => {
  const products = getProductsData();
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  products[index] = {
    ...products[index],
    ...req.body
  };
  saveProductsData(products);
  res.json({ success: true, product: products[index] });
});

// DELETE product (Admin)
router.delete('/:id', (req, res) => {
  let products = getProductsData();
  const initialLength = products.length;
  products = products.filter(p => p.id !== req.params.id);
  
  if (products.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  saveProductsData(products);
  res.json({ success: true, message: 'Product deleted successfully' });
});

export default router;
