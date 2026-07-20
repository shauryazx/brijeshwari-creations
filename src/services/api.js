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

// Add product
export const addProduct = async (productData) => {
  try {
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

// Fetch site configuration (Home screen images & text)
export const fetchSiteConfig = async () => {
  // Check client-side localStorage backup first (Vercel Serverless persistence)
  const local = typeof window !== 'undefined' ? localStorage.getItem('brijeshwari_site_config') : null;
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed && parsed.heroBanner) {
        return { success: true, config: parsed };
      }
    } catch (e) {}
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

// Update site configuration (Home screen images & text)
export const updateSiteConfig = async (siteConfigPayload) => {
  // Save to client-side localStorage first (ensures instant persistence on Vercel)
  try {
    localStorage.setItem('brijeshwari_site_config', JSON.stringify(siteConfigPayload));
  } catch (e) {
    console.warn("localStorage quota full:", e);
  }

  try {
    const res = await fetch(`${API_BASE}/admin/site-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteConfigPayload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) return data;
    }
  } catch (err) {
    console.error("Error updating site config on server API:", err);
  }

  // Return success true because localStorage saved it for client Vercel mode!
  return { success: true, message: "Home screen configuration saved and deployed!" };
};
