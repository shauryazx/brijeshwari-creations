import { 
  uploadImageToFirebase, 
  saveSiteConfigToFirebase, 
  getSiteConfigFromFirebase 
} from '../config/firebase.js';

const API_BASE = '/api';

// Fetch products with optional filtering
export const fetchProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products${query ? `?${query}` : ''}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error fetching products:", err);
  }

  // Local fallback
  const localProds = localStorage.getItem('brijeshwari_products');
  if (localProds) {
    try {
      return { success: true, products: JSON.parse(localProds) };
    } catch (e) {}
  }
  return { success: false, products: [] };
};

// Add product (uploads images to Firebase Cloud Storage)
export const addProduct = async (productData) => {
  try {
    // Process photos through Firebase Cloud Storage if base64 Data URLs
    if (productData.images && productData.images.length > 0) {
      const cloudImages = await Promise.all(
        productData.images.map((img, idx) => uploadImageToFirebase(img, `product_${Date.now()}_${idx}`))
      );
      productData.images = cloudImages;
    }

    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error adding product:", err);
  }
  return { success: false };
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    if (productData.images && productData.images.length > 0) {
      const cloudImages = await Promise.all(
        productData.images.map((img, idx) => uploadImageToFirebase(img, `product_${Date.now()}_${idx}`))
      );
      productData.images = cloudImages;
    }

    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error updating product:", err);
  }
  return { success: false };
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error deleting product:", err);
  }
  return { success: false };
};

// Fetch categories
export const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE}/admin/categories`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
  return { success: false, categories: [] };
};

// Create category
export const createCategory = async (catData) => {
  try {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catData)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error creating category:", err);
  }
  return { success: false };
};

// Update category
export const updateCategory = async (id, catData) => {
  try {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catData)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error updating category:", err);
  }
  return { success: false };
};

// Delete category
export const deleteCategory = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error deleting category:", err);
  }
  return { success: false };
};

// Fetch admin orders
export const fetchAdminOrders = async () => {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error fetching orders:", err);
  }
  return { success: false, orders: [] };
};

// Create customer order
export const createOrder = async (orderPayload) => {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error creating order:", err);
  }
  return { success: false };
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  try {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error updating order status:", err);
  }
  return { success: false };
};

// Fetch admin stats
export const fetchAdminStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error fetching admin stats:", err);
  }
  return { success: false, stats: null };
};

// Process payment
export const processPayment = async (paymentPayload) => {
  try {
    const res = await fetch(`${API_BASE}/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentPayload)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error processing payment:", err);
  }
  return { success: false, error: 'Payment processing error' };
};

// Fetch public payment gateway configuration
export const fetchPublicPaymentConfig = async () => {
  try {
    const res = await fetch(`${API_BASE}/payments/config`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error fetching public payment config:", err);
  }
  return { success: false };
};

// Fetch admin full payment gateway configuration
export const fetchAdminPaymentConfig = async () => {
  try {
    const res = await fetch(`${API_BASE}/payments/admin/config`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error fetching admin payment config:", err);
  }
  return { success: false };
};

// Update admin payment gateway configuration
export const updateAdminPaymentConfig = async (configPayload) => {
  try {
    const res = await fetch(`${API_BASE}/payments/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configPayload)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error updating admin payment config:", err);
  }
  return { success: false };
};

// Fetch site configuration (Home screen images & text from Firebase & API)
export const fetchSiteConfig = async () => {
  // Check Firebase / local storage first
  const firebaseConfig = await getSiteConfigFromFirebase();
  if (firebaseConfig && firebaseConfig.heroBanner) {
    return { success: true, config: firebaseConfig };
  }

  try {
    const res = await fetch(`${API_BASE}/admin/site-config`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.config) {
        return data;
      }
    }
  } catch (err) {
    console.error("Error fetching site config from API:", err);
  }

  return { success: false };
};

// Update site configuration (Uploads all banner photos to Firebase Cloud Storage & Firestore)
export const updateSiteConfig = async (siteConfigPayload) => {
  try {
    const payload = JSON.parse(JSON.stringify(siteConfigPayload));

    // Upload Hero images to Firebase Storage if base64 Data URLs
    if (payload.heroBanner) {
      if (payload.heroBanner.heroImage) {
        payload.heroBanner.heroImage = await uploadImageToFirebase(payload.heroBanner.heroImage, `hero_model_${Date.now()}`);
      }
      if (payload.heroBanner.urliImage) {
        payload.heroBanner.urliImage = await uploadImageToFirebase(payload.heroBanner.urliImage, `urli_diya_${Date.now()}`);
      }
    }

    // Upload Editorial section images to Firebase Storage
    if (Array.isArray(payload.sections)) {
      const updatedSections = await Promise.all(
        payload.sections.map(async (sec, idx) => {
          if (sec.image) {
            sec.image = await uploadImageToFirebase(sec.image, `section_${idx}_${Date.now()}`);
          }
          return sec;
        })
      );
      payload.sections = updatedSections;
    }

    // Save to Firebase Cloud Storage & Firestore
    await saveSiteConfigToFirebase(payload);

    // Save to API server if available
    try {
      const res = await fetch(`${API_BASE}/admin/site-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) return { ...data, config: payload };
      }
    } catch (err) {
      console.warn("API server save fallback to Firebase:", err);
    }

    return { success: true, message: "🔥 Saved and deployed to Firebase Cloud Storage!", config: payload };
  } catch (err) {
    console.error("Error updating site config with Firebase:", err);
    return { success: false, message: err.message };
  }
};
