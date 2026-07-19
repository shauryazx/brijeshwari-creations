import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES_FILE = path.join(__dirname, '../data/categories.json');
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');
const ORDERS_FILE = path.join(__dirname, '../data/orders.json');
const SITE_CONFIG_FILE = path.join(__dirname, '../data/site_config.json');

const router = express.Router();

// Helper to read site config
const getSiteConfig = () => {
  try {
    if (fs.existsSync(SITE_CONFIG_FILE)) {
      const data = fs.readFileSync(SITE_CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading site_config.json:", e);
  }
  return {
    heroBanner: {
      tagline: "KRAFT & HERITAGE",
      title: "Banarasi Saree Collection",
      description: "Terracotta Coral, deep warm charcoal, parchment cream, and heritage ochre gold.",
      buttonText: "SHOP NOW",
      redirectTarget: "Clothing",
      heroImage: "/images/saree_hero.jpg",
      urliImage: "/images/urli_center.jpg"
    },
    sections: [
      { id: "sec-1", title: "Terracotta Sarees", description: "Authentic handwoven silk sarees.", image: "/images/saree_hero.jpg", buttonText: "SHOP NOW", redirectTarget: "Clothing" },
      { id: "sec-2", title: "Indians Terracotta Collections", description: "Our finest handloom weaves.", image: "/images/saree_charcoal.jpg", buttonText: "SHOP MORE", redirectTarget: "Clothing" },
      { id: "sec-3", title: "Heritage Collections", description: "Curated zari woven sarees.", image: "/images/saree_ochre.jpg", buttonText: "SHOP NOW", redirectTarget: "Clothing" }
    ]
  };
};

// Helper to save site config
const saveSiteConfig = (config) => {
  try {
    fs.writeFileSync(SITE_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error("Error saving site_config.json:", e);
    return false;
  }
};

// Helper to read categories
const getCategories = () => {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      const data = fs.readFileSync(CATEGORIES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading categories.json:", e);
  }
  return [];
};

// Helper to save categories
const saveCategories = (categories) => {
  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error("Error saving categories.json:", e);
    return false;
  }
};

// GET Public Site Config
router.get('/site-config', (req, res) => {
  res.json({ success: true, config: getSiteConfig() });
});

// POST Admin Update Site Config (Home screen images, redirect links & dynamic sections)
router.post('/site-config', (req, res) => {
  const newConfig = req.body;
  const saved = saveSiteConfig(newConfig);
  if (saved) {
    res.json({ success: true, message: "Home screen sections & button redirect links updated successfully!", config: newConfig });
  } else {
    res.status(500).json({ success: false, message: "Failed to update home screen configuration." });
  }
});

// GET Admin Dashboard Stats
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalSales: 345990,
      totalOrdersCount: 28,
      activeProductsCount: 16,
      customerSatisfaction: "99.4%"
    }
  });
});

// GET Categories
router.get('/categories', (req, res) => {
  res.json({ success: true, categories: getCategories() });
});

// POST Create Category
router.post('/categories', (req, res) => {
  const { name, subcategories } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

  const categories = getCategories();
  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    subcategories: subcategories || []
  };

  categories.push(newCat);
  saveCategories(categories);
  res.status(201).json({ success: true, category: newCat });
});

// PUT Update Category
router.put('/categories/:id', (req, res) => {
  const { name, subcategories } = req.body;
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  categories[index] = {
    ...categories[index],
    name: name || categories[index].name,
    subcategories: subcategories || categories[index].subcategories
  };

  saveCategories(categories);
  res.json({ success: true, category: categories[index] });
});

// DELETE Category
router.delete('/:id', (req, res) => {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== req.params.id);
  saveCategories(filtered);
  res.json({ success: true, message: 'Category deleted successfully' });
});

export default router;
