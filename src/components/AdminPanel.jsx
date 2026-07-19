import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  RefreshCw, 
  Upload, 
  FolderPlus, 
  Layers,
  Image as ImageIcon,
  Check,
  X,
  BellRing,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
  CreditCard,
  QrCode,
  ShieldCheck,
  Save,
  CheckCircle2,
  Key,
  Globe,
  Layout,
  ExternalLink,
  Link2
} from 'lucide-react';
import { 
  fetchAdminStats, 
  fetchAdminOrders, 
  fetchProducts,
  addProduct, 
  updateProduct,
  deleteProduct, 
  updateOrderStatus,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchAdminPaymentConfig,
  updateAdminPaymentConfig,
  fetchSiteConfig,
  updateSiteConfig
} from '../services/api';
import { playLoudOrderRingSound, stopLoudOrderRingSound } from '../services/sound';
import { useCart } from '../context/CartContext';

export const AdminPanel = ({ onBackToStore }) => {
  const { formatPrice } = useCart();
  const [activeTab, setActiveTab] = useState('ORDERS');
  
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Order Alarm State
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isRinging, setIsRinging] = useState(false);

  // Payment Setup State
  const [paymentConfig, setPaymentConfig] = useState({
    environment: 'LIVE',
    razorpay: { enabled: true, keyId: 'rzp_live_brijeshwari_key', keySecret: '••••••••••••' },
    stripe: { enabled: true, publishableKey: 'pk_live_brijeshwari', secretKey: '••••••••••••' },
    upi: { enabled: true, vpa: 'brijeshwari@upi', merchantName: 'Brijeshwari Creations' },
    cod: { enabled: true, minAmount: 0 }
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentSavedMsg, setPaymentSavedMsg] = useState(null);

  // Home Screen Banners & Graphics State
  const [siteConfig, setSiteConfig] = useState({
    heroBanner: {
      tagline: 'KRAFT & HERITAGE',
      title: 'Banarasi Saree Collection',
      description: 'Terracotta Coral, deep warm charcoal, parchment cream, and heritage ochre gold.',
      buttonText: 'SHOP NOW',
      redirectTarget: 'Clothing',
      heroImage: '/images/saree_hero.jpg',
      urliImage: '/images/urli_center.jpg'
    },
    sections: [
      { id: 'sec-1', title: 'Terracotta Sarees', description: 'Authentic handwoven silk sarees with warm coral undertones.', image: '/images/saree_hero.jpg', buttonText: 'SHOP NOW', redirectTarget: 'Clothing' },
      { id: 'sec-2', title: 'Indians Terracotta Collections', description: 'Our finest handloom weaves and master artisan collections.', image: '/images/saree_charcoal.jpg', buttonText: 'SHOP MORE', redirectTarget: 'Clothing' },
      { id: 'sec-3', title: 'Heritage Collections', description: 'Curated zari woven sarees and handcrafted parchment cream.', image: '/images/saree_ochre.jpg', buttonText: 'SHOP NOW', redirectTarget: 'Clothing' }
    ]
  });
  const [savingSiteConfig, setSavingSiteConfig] = useState(false);
  const [siteSavedMsg, setSiteSavedMsg] = useState(null);
  const [siteConfigDirty, setSiteConfigDirty] = useState(false);

  // Edit / Add Product State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Clothing',
    subcategory: 'Banarasi Sarees',
    price: 18999,
    originalPrice: 22999,
    material: 'Silk',
    stock: 12,
    badge: 'Banarasi Special',
    description: 'Authentic handwoven silk saree from Varanasi.',
    images: []
  });

  // Edit / Add Category State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    subcategoriesInput: ''
  });

  const loadAllAdminData = async () => {
    const [statsRes, ordersRes, productsRes, categoriesRes, paymentRes, siteRes] = await Promise.all([
      fetchAdminStats(),
      fetchAdminOrders(),
      fetchProducts(),
      fetchCategories(),
      fetchAdminPaymentConfig(),
      fetchSiteConfig()
    ]);

    if (statsRes && statsRes.stats) setStats(statsRes.stats);
    if (productsRes && productsRes.products && !showProductModal) setProductsList(productsRes.products);
    if (categoriesRes && categoriesRes.categories) setCategoriesList(categoriesRes.categories);
    if (paymentRes && paymentRes.config) setPaymentConfig(paymentRes.config);
    if (siteRes && siteRes.config && !siteConfigDirty) setSiteConfig(siteRes.config);

    if (ordersRes && ordersRes.orders) {
      const currentOrders = ordersRes.orders;
      setOrders(currentOrders);

      // Pending orders requiring Accept/Decline decision (status === 'Processing')
      const unhandled = currentOrders.filter(o => (o.orderStatus || '').toLowerCase() === 'processing');
      setPendingOrders(unhandled);

      if (unhandled.length > 0) {
        setIsRinging(true);
        playLoudOrderRingSound();
      } else {
        setIsRinging(false);
        stopLoudOrderRingSound();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAllAdminData();

    const pollInterval = setInterval(() => {
      loadAllAdminData();
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      stopLoudOrderRingSound();
    };
  }, [showProductModal, siteConfigDirty]);

  const handleAcceptOrder = async (orderId) => {
    await updateOrderStatus(orderId, 'Accepted');
    loadAllAdminData();
  };

  const handleDeclineOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to DECLINE this order?")) {
      await updateOrderStatus(orderId, 'Declined');
      loadAllAdminData();
    }
  };

  // Handle Saving Real Payment Setup
  const handleSavePaymentConfig = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    setPaymentSavedMsg(null);

    const res = await updateAdminPaymentConfig(paymentConfig);
    setSavingPayment(false);

    if (res && res.success) {
      setPaymentSavedMsg("✨ Payment Setup Updated & Deployed LIVE Successfully!");
      setTimeout(() => setPaymentSavedMsg(null), 4000);
    } else {
      alert("Failed to save payment gateway config.");
    }
  };

  // Handle Saving Site Banners & Graphics Setup
  const handleSaveSiteConfig = async (e) => {
    e.preventDefault();
    setSavingSiteConfig(true);
    setSiteSavedMsg(null);

    const res = await updateSiteConfig(siteConfig);
    setSavingSiteConfig(false);

    if (res && res.success) {
      setSiteConfigDirty(false);
      setSiteSavedMsg("✨ Home Screen Banners, Redirect Links & Custom Sections Deployed LIVE!");
      setTimeout(() => setSiteSavedMsg(null), 4000);
    } else {
      alert("Failed to update home screen configuration.");
    }
  };

  // Add a new custom home section
  const handleAddCustomSection = () => {
    setSiteConfigDirty(true);
    const newSection = {
      id: `sec-${Date.now()}`,
      title: 'New Heritage Collection Section',
      description: 'Handcrafted luxury creation from master artisans.',
      image: '/images/saree_hero.jpg',
      buttonText: 'SHOP NOW',
      redirectTarget: categoriesList[0]?.name || 'Clothing'
    };

    setSiteConfig({
      ...siteConfig,
      sections: [...(siteConfig.sections || []), newSection]
    });
  };

  // Delete a custom home section
  const handleDeleteCustomSection = (id) => {
    if (window.confirm("Are you sure you want to remove this home section?")) {
      setSiteConfigDirty(true);
      setSiteConfig({
        ...siteConfig,
        sections: siteConfig.sections.filter(s => s.id !== id)
      });
    }
  };

  // Single Image Upload Helper
  const handleSingleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    setSiteConfigDirty(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Product Image Upload handler
  const handleImageFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Product Save / Edit Handler
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct(editingProduct.id, productForm);
    } else {
      await addProduct(productForm);
    }
    setShowProductModal(false);
    setEditingProduct(null);
    loadAllAdminData();
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categoriesList[0]?.name || 'Clothing',
      subcategory: categoriesList[0]?.subcategories?.[0] || 'Banarasi Sarees',
      price: 14999,
      originalPrice: 18999,
      material: 'Silk',
      stock: 15,
      badge: 'Heritage Classic',
      description: 'Handcrafted luxury creation from Brijeshwari master artisans.',
      images: []
    });
    setShowProductModal(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      subcategory: prod.subcategory,
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price,
      material: prod.material,
      stock: prod.stock,
      badge: prod.badge || '',
      description: prod.description,
      images: prod.images || []
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product listing?")) {
      await deleteProduct(id);
      loadAllAdminData();
    }
  };

  // Category Save / Edit Handler
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const subsArray = categoryForm.subcategoriesInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      name: categoryForm.name,
      subcategories: subsArray
    };

    if (editingCategory) {
      await updateCategory(editingCategory.id, payload);
    } else {
      await createCategory(payload);
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
    loadAllAdminData();
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', subcategoriesInput: '' });
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      subcategoriesInput: cat.subcategories ? cat.subcategories.join(', ') : ''
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteCategory(id);
      loadAllAdminData();
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    loadAllAdminData();
  };

  return (
    <div className="min-h-screen bg-brand-parchment py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* CONTINUOUS LOUD ALARM BANNER */}
      {pendingOrders.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 text-white border-4 border-yellow-300 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-white text-rose-600 rounded-2xl animate-spin">
              <BellRing size={32} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/40">
                🔔 LOUD ALARM ({pendingOrders.length} NEW ORDER PENDING DECISION)
              </span>
              <h3 className="font-serif font-black text-2xl mt-1 leading-tight">
                Ringing Alarm Active! Click ACCEPT or DECLINE to stop sound
              </h3>
              <p className="text-xs text-white/90">
                New Order: <strong>{pendingOrders[0].id}</strong> by {pendingOrders[0].customer?.fullName} ({formatPrice(pendingOrders[0].totalAmount)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAcceptOrder(pendingOrders[0].id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2"
            >
              <CheckCircle size={18} /> ACCEPT ORDER
            </button>
            <button
              onClick={() => handleDeclineOrder(pendingOrders[0].id)}
              className="bg-rose-950 hover:bg-black text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center gap-1.5"
            >
              <XCircle size={18} /> DECLINE
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-borderTerracotta">
        <div>
          <span className="bg-brand-terracotta text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
            Admin Master Control Portal
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-brand-charcoal mt-1">
            Brijeshwari Admin Dashboard
          </h1>
          <p className="text-xs text-stone-500">
            Full Website Customization • Section Builder & Button Redirect Links Control
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            className="p-2.5 bg-white border border-stone-300 rounded-xl text-stone-700 hover:text-brand-terracotta shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={onBackToStore}
            className="bg-brand-charcoal text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:bg-brand-charcoalLight transition-all"
          >
            ← Back to Storefront
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'ORDERS' 
              ? 'border-brand-terracotta text-brand-terracotta' 
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingBag size={18} /> Customer Orders ({orders.length}) {pendingOrders.length > 0 && <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">{pendingOrders.length} RINGING</span>}
        </button>

        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'PRODUCTS' 
              ? 'border-brand-terracotta text-brand-terracotta' 
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package size={18} /> Product Inventory ({productsList.length})
        </button>

        <button
          onClick={() => setActiveTab('HOME_GRAPHICS')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'HOME_GRAPHICS' 
              ? 'border-brand-terracotta text-brand-terracotta' 
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Layout size={18} /> Home Banners & Redirect Links 🔗 {siteConfigDirty && <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />}
        </button>

        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'CATEGORIES' 
              ? 'border-brand-terracotta text-brand-terracotta' 
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Layers size={18} /> Category Manager ({categoriesList.length})
        </button>

        <button
          onClick={() => setActiveTab('PAYMENT_SETUP')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'PAYMENT_SETUP' 
              ? 'border-brand-terracotta text-brand-terracotta' 
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CreditCard size={18} /> Real Payment Setup 💳
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'ANALYTICS' 
              ? 'border-brand-terracotta text-brand-terracotta' 
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BarChart3 size={18} /> Daily Sales & Metrics
        </button>
      </div>

      {/* TAB 1: CUSTOMER ORDERS */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold text-brand-charcoal">Customer Orders Manager</h3>
            <span className="text-xs text-stone-500">Click Accept or Decline for new pending orders</span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed text-center text-stone-400 italic space-y-2">
              <ShoppingBag size={36} className="mx-auto text-stone-300" />
              <p className="font-bold text-stone-600">No Customer Orders Placed Yet</p>
              <p className="text-xs text-stone-400">As soon as a customer purchases, the loud alarm will ring until you Accept or Decline.</p>
            </div>
          ) : (
            orders.map((ord) => {
              const statusLower = (ord.orderStatus || '').toLowerCase();
              const isProcessing = statusLower === 'processing';
              const isAccepted = statusLower === 'accepted';
              const isDeclined = statusLower === 'declined';

              return (
                <div 
                  key={ord.id} 
                  className={`p-6 rounded-3xl border transition-all ${
                    isProcessing 
                      ? 'bg-amber-50 border-2 border-amber-400 shadow-md' 
                      : isDeclined 
                        ? 'bg-rose-50 border-rose-200' 
                        : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-brand-terracotta text-base">{ord.id}</span>
                        {isProcessing && (
                          <span className="bg-rose-600 text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full animate-pulse">
                            🔔 PENDING DECISION
                          </span>
                        )}
                        {isAccepted && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-extrabold px-3 py-1 rounded-full border border-emerald-300">
                            ✓ ACCEPTED
                          </span>
                        )}
                        {isDeclined && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] uppercase font-extrabold px-3 py-1 rounded-full border border-rose-300">
                            ✕ DECLINED
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-stone-500 block mt-0.5">Placed on {new Date(ord.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isProcessing ? (
                        <>
                          <button
                            onClick={() => handleAcceptOrder(ord.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                          >
                            <CheckCircle size={16} /> Accept Order
                          </button>

                          <button
                            onClick={() => handleDeclineOrder(ord.id)}
                            className="bg-rose-800 hover:bg-rose-900 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                          >
                            <XCircle size={16} /> Decline Order
                          </button>
                        </>
                      ) : (
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                          className="text-xs p-2 border border-stone-300 rounded-xl bg-white font-bold text-brand-charcoal"
                        >
                          <option value="Accepted">Status: Accepted</option>
                          <option value="Shipped">Status: Shipped in Transit</option>
                          <option value="Delivered">Status: Delivered</option>
                          <option value="Declined">Status: Declined</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3">
                    <div>
                      <span className="font-bold text-stone-700 block">Customer Information</span>
                      <p className="text-stone-600 mt-1">
                        {ord.customer?.fullName} • Phone: {ord.customer?.phone || 'N/A'}<br />
                        Email: {ord.customer?.email}<br />
                        Address: {ord.customer?.address}, {ord.customer?.city} ({ord.customer?.pincode})
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <span className="font-bold text-stone-700 block">Payment Summary</span>
                      <span className="font-serif text-2xl font-black text-brand-terracotta">
                        {formatPrice(ord.totalAmount)}
                      </span>
                      <span className="block text-[11px] text-emerald-800 font-bold">
                        Paid via {ord.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGER */}
      {activeTab === 'PRODUCTS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-bold text-brand-charcoal">Manage Products</h3>
              <p className="text-xs text-stone-500">Upload images from your computer and modify stock/pricing</p>
            </div>
            <button
              onClick={openAddProductModal}
              className="bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              <Plus size={16} /> Add Product from Computer
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-parchmentDark border-b border-stone-200 text-stone-600 font-bold uppercase">
                <tr>
                  <th className="p-3">Image</th>
                  <th className="p-3">Title & Material</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {productsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400 italic">
                      No products added yet. Click "Add Product from Computer" to create your catalog!
                    </td>
                  </tr>
                ) : (
                  productsList.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3">
                        <img 
                          src={p.images?.[0] || ''} 
                          alt={p.name} 
                          className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                        />
                      </td>
                      <td className="p-3">
                        <span className="font-serif font-bold text-sm text-brand-charcoal block line-clamp-1">{p.name}</span>
                        <span className="text-[10px] text-stone-400">Material: {p.material}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-brand-terracotta">{p.category}</span>
                        <span className="block text-[10px] text-stone-500">{p.subcategory}</span>
                      </td>
                      <td className="p-3 font-bold text-stone-900">{formatPrice(p.price)}</td>
                      <td className="p-3">
                        <span className={`font-extrabold px-2 py-0.5 rounded-full ${
                          p.stock <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="p-1.5 bg-stone-100 hover:bg-brand-terracotta hover:text-white rounded-lg text-stone-600 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg text-rose-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showProductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
              <div className="relative w-full max-w-2xl bg-brand-parchment rounded-3xl border border-brand-borderTerracotta shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5">
                <div className="flex justify-between items-center border-b pb-3 border-stone-200">
                  <h4 className="font-serif text-xl font-extrabold text-brand-charcoal">
                    {editingProduct ? 'Edit Product Details' : 'Add New Heritage Product'}
                  </h4>
                  <button onClick={() => setShowProductModal(false)} className="text-stone-400 hover:text-brand-terracotta">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Category</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-brand-terracotta"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Subcategory</label>
                      <input
                        type="text"
                        required
                        value={productForm.subcategory}
                        onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                        className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Material</label>
                      <input
                        type="text"
                        value={productForm.material}
                        onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                        className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                        className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                    />
                  </div>

                  <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-stone-300 space-y-3 text-center">
                    <div className="flex items-center justify-center gap-2 font-bold text-stone-700">
                      <Upload size={18} className="text-brand-terracotta" />
                      <span>Upload Product Images From Computer</span>
                    </div>
                    
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="computer-file-input"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="computer-file-input"
                      className="inline-flex items-center gap-2 bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-bold text-xs px-5 py-2 rounded-xl cursor-pointer shadow-md transition-all"
                    >
                      <ImageIcon size={16} /> Choose Image File from PC
                    </label>

                    {productForm.images.length > 0 && (
                      <div className="flex flex-wrap gap-3 pt-3 justify-center">
                        {productForm.images.map((img, idx) => (
                          <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-300 shadow-sm group">
                            <img src={img} alt="preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeUploadedImage(idx)}
                              className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="px-5 py-2.5 border border-stone-300 text-stone-700 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-bold px-7 py-2.5 rounded-xl shadow-md"
                    >
                      Save Product Listing
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 3: HOME BANNERS & GRAPHICS MANAGER WITH DYNAMIC SECTION BUILDER */}
      {activeTab === 'HOME_GRAPHICS' && (
        <form onSubmit={handleSaveSiteConfig} className="space-y-8 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-brand-terracottaLight text-brand-terracotta px-3 py-1 rounded-full border border-brand-borderTerracotta">
                🖼️ WEBSITE CUSTOMIZATION & SECTION BUILDER
              </span>
              <h3 className="font-serif text-2xl font-black text-brand-charcoal mt-1">
                Customize Home Screen Images, Sections & Button Redirect Links
              </h3>
              <p className="text-xs text-stone-500">Upload images from PC, edit titles, add unlimited sections, and set button click targets</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddCustomSection}
                className="bg-brand-charcoal hover:bg-stone-800 text-brand-gold font-bold text-xs px-5 py-3 rounded-2xl shadow-md flex items-center gap-2"
              >
                <Plus size={16} /> + Add Custom Home Section
              </button>

              <button
                type="submit"
                disabled={savingSiteConfig}
                className="bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-extrabold text-xs px-7 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-all"
              >
                <Save size={16} />
                {savingSiteConfig ? 'Saving Website...' : 'Save & Update Home Screen Live'}
              </button>
            </div>
          </div>

          {siteSavedMsg && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={18} className="text-emerald-700" />
              <span>{siteSavedMsg}</span>
            </div>
          )}

          {siteConfigDirty && (
            <div className="p-3 bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-700" />
              <span>You have unsaved changes! Click "Save & Update Home Screen Live" above to apply your edits.</span>
            </div>
          )}

          {/* MAIN HERO BANNER GRAPHICS & REDIRECT TARGET */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h4 className="font-serif font-bold text-lg text-brand-charcoal border-b pb-2 flex items-center gap-2">
              <Layout size={20} className="text-brand-terracotta" />
              1. Hero Main Banner Graphics & Button Redirect
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Hero Main Model Image */}
              <div className="p-4 bg-brand-parchment rounded-2xl border border-stone-300 space-y-3">
                <span className="font-bold text-xs text-stone-700 block">Left Hero Saree Model Photo</span>
                
                <div className="relative h-56 rounded-xl overflow-hidden border border-stone-300 bg-stone-100 flex items-center justify-center">
                  {siteConfig.heroBanner?.heroImage ? (
                    <img src={siteConfig.heroBanner.heroImage} alt="Hero Saree Model" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-stone-400">No Image Uploaded</span>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  id="hero-image-file"
                  className="hidden"
                  onChange={(e) => handleSingleImageUpload(e, (dataUrl) => {
                    setSiteConfig({
                      ...siteConfig,
                      heroBanner: { ...siteConfig.heroBanner, heroImage: dataUrl }
                    });
                  })}
                />
                <label
                  htmlFor="hero-image-file"
                  className="w-full bg-brand-terracotta text-white font-bold text-xs py-2.5 rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload size={14} /> Upload Hero Model Photo from PC
                </label>
              </div>

              {/* Hero Center Urli Diya Bowl Image */}
              <div className="p-4 bg-brand-parchment rounded-2xl border border-stone-300 space-y-3">
                <span className="font-bold text-xs text-stone-700 block">Center Urli Diya Bowl Photo</span>
                
                <div className="relative h-56 rounded-xl overflow-hidden border border-stone-300 bg-stone-100 flex items-center justify-center">
                  {siteConfig.heroBanner?.urliImage ? (
                    <img src={siteConfig.heroBanner.urliImage} alt="Center Urli Diya" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-stone-400">No Image Uploaded</span>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  id="urli-image-file"
                  className="hidden"
                  onChange={(e) => handleSingleImageUpload(e, (dataUrl) => {
                    setSiteConfig({
                      ...siteConfig,
                      heroBanner: { ...siteConfig.heroBanner, urliImage: dataUrl }
                    });
                  })}
                />
                <label
                  htmlFor="urli-image-file"
                  className="w-full bg-brand-terracotta text-white font-bold text-xs py-2.5 rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload size={14} /> Upload Center Urli Diya Photo from PC
                </label>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Hero Headline Title</label>
                <input
                  type="text"
                  value={siteConfig.heroBanner?.title || ''}
                  onChange={(e) => {
                    setSiteConfigDirty(true);
                    setSiteConfig({
                      ...siteConfig,
                      heroBanner: { ...siteConfig.heroBanner, title: e.target.value }
                    });
                  }}
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta font-serif font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Hero Description</label>
                <input
                  type="text"
                  value={siteConfig.heroBanner?.description || ''}
                  onChange={(e) => {
                    setSiteConfigDirty(true);
                    setSiteConfig({
                      ...siteConfig,
                      heroBanner: { ...siteConfig.heroBanner, description: e.target.value }
                    });
                  }}
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                />
              </div>

              {/* BUTTON REDIRECT TARGET */}
              <div>
                <label className="font-bold text-brand-terracotta flex items-center gap-1.5 mb-1">
                  <Link2 size={14} /> Hero "SHOP NOW" Redirect Target
                </label>
                <select
                  value={siteConfig.heroBanner?.redirectTarget || 'Clothing'}
                  onChange={(e) => {
                    setSiteConfigDirty(true);
                    setSiteConfig({
                      ...siteConfig,
                      heroBanner: { ...siteConfig.heroBanner, redirectTarget: e.target.value }
                    });
                  }}
                  className="w-full p-2.5 border border-brand-terracotta rounded-xl bg-brand-terracottaLight font-bold text-brand-charcoal focus:outline-none"
                >
                  <option value="All">All Products Catalog</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>Category: {cat.name}</option>
                  ))}
                  <option value="Wishlist">Saved Wishlist</option>
                </select>
              </div>
            </div>
          </div>

          {/* DYNAMIC EDITORIAL HOME SECTIONS BUILDER */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-serif font-bold text-lg text-brand-charcoal flex items-center gap-2">
                <Layers size={20} className="text-brand-terracotta" />
                2. Dynamic Home Screen Editorial Sections ({siteConfig.sections?.length || 0})
              </h4>

              <button
                type="button"
                onClick={handleAddCustomSection}
                className="bg-brand-terracotta text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-brand-terracottaDark"
              >
                <Plus size={14} /> + Add Custom Home Section
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(siteConfig.sections || []).map((sec, index) => (
                <div key={sec.id || index} className="p-5 bg-brand-parchment rounded-3xl border border-stone-300 space-y-4 relative shadow-sm">
                  
                  <div className="flex justify-between items-center border-b pb-2 border-stone-200">
                    <span className="font-serif font-bold text-sm text-brand-terracotta">
                      Section #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomSection(sec.id)}
                      className="p-1.5 bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Section Image Upload */}
                  <div className="space-y-2">
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-stone-300 bg-stone-100 flex items-center justify-center">
                      <img src={sec.image} alt={sec.title} className="w-full h-full object-cover" />
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      id={`sec-img-file-${sec.id || index}`}
                      className="hidden"
                      onChange={(e) => handleSingleImageUpload(e, (dataUrl) => {
                        const updatedSections = [...siteConfig.sections];
                        updatedSections[index] = { ...updatedSections[index], image: dataUrl };
                        setSiteConfig({ ...siteConfig, sections: updatedSections });
                      })}
                    />
                    <label
                      htmlFor={`sec-img-file-${sec.id || index}`}
                      className="w-full bg-brand-terracotta text-white font-bold text-xs py-2 rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Upload size={14} /> Upload Section Photo from PC
                    </label>
                  </div>

                  {/* Section Text & Redirect Target */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Section Headline Title</label>
                      <input
                        type="text"
                        value={sec.title || ''}
                        onChange={(e) => {
                          setSiteConfigDirty(true);
                          const updatedSections = [...siteConfig.sections];
                          updatedSections[index] = { ...updatedSections[index], title: e.target.value };
                          setSiteConfig({ ...siteConfig, sections: updatedSections });
                        }}
                        className="w-full p-2.5 border border-stone-300 rounded-xl font-serif font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Description Paragraph</label>
                      <textarea
                        rows={2}
                        value={sec.description || ''}
                        onChange={(e) => {
                          setSiteConfigDirty(true);
                          const updatedSections = [...siteConfig.sections];
                          updatedSections[index] = { ...updatedSections[index], description: e.target.value };
                          setSiteConfig({ ...siteConfig, sections: updatedSections });
                        }}
                        className="w-full p-2.5 border border-stone-300 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Button Text</label>
                        <input
                          type="text"
                          value={sec.buttonText || 'SHOP NOW'}
                          onChange={(e) => {
                            setSiteConfigDirty(true);
                            const updatedSections = [...siteConfig.sections];
                            updatedSections[index] = { ...updatedSections[index], buttonText: e.target.value };
                            setSiteConfig({ ...siteConfig, sections: updatedSections });
                          }}
                          className="w-full p-2 border border-stone-300 rounded-lg uppercase font-bold text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-brand-terracotta block mb-1">Button Redirect</label>
                        <select
                          value={sec.redirectTarget || 'Clothing'}
                          onChange={(e) => {
                            setSiteConfigDirty(true);
                            const updatedSections = [...siteConfig.sections];
                            updatedSections[index] = { ...updatedSections[index], redirectTarget: e.target.value };
                            setSiteConfig({ ...siteConfig, sections: updatedSections });
                          }}
                          className="w-full p-2 border border-brand-terracotta rounded-lg bg-brand-terracottaLight font-bold text-[11px]"
                        >
                          <option value="All">All Catalog</option>
                          {categoriesList.map((cat) => (
                            <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          </div>

        </form>
      )}

      {/* TAB 4: CATEGORY MANAGER */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-bold text-brand-charcoal">Category Manager</h3>
              <p className="text-xs text-stone-500">Add, edit, or remove categories and subcategories</p>
            </div>
            <button
              onClick={openAddCategoryModal}
              className="bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              <FolderPlus size={16} /> Add New Category
            </button>
          </div>

          {categoriesList.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-stone-300 text-center space-y-3">
              <Layers size={32} className="mx-auto text-stone-400" />
              <h4 className="font-bold text-stone-700">No Categories Created Yet</h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoriesList.map((cat) => (
                <div key={cat.id || cat.name} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h4 className="font-serif font-bold text-lg text-brand-charcoal">{cat.name}</h4>
                      <span className="text-xs text-stone-400">ID: {cat.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditCategoryModal(cat)}
                        className="p-1.5 bg-stone-100 hover:bg-brand-terracotta hover:text-white rounded-lg text-stone-600 transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg text-rose-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                      Subcategories ({cat.subcategories?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(cat.subcategories || []).map((sub) => (
                        <span key={typeof sub === 'string' ? sub : sub.name} className="bg-brand-parchmentDark border border-stone-200 text-stone-800 text-xs px-3 py-1 rounded-full font-medium">
                          • {typeof sub === 'string' ? sub : sub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showCategoryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/70 backdrop-blur-sm animate-fadeIn">
              <div className="relative w-full max-w-md bg-brand-parchment rounded-3xl border border-brand-borderTerracotta shadow-2xl p-6 sm:p-8 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-serif text-lg font-bold text-brand-charcoal">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h4>
                  <button onClick={() => setShowCategoryModal(false)} className="text-stone-400 hover:text-brand-terracotta">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Subcategories (Comma separated)</label>
                    <textarea
                      rows={3}
                      value={categoryForm.subcategoriesInput}
                      onChange={(e) => setCategoryForm({ ...categoryForm, subcategoriesInput: e.target.value })}
                      className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-brand-terracotta"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(false)}
                      className="px-4 py-2 border border-stone-300 font-bold rounded-lg text-stone-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-bold px-6 py-2 rounded-lg shadow-md"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 5: REAL PAYMENT GATEWAY SETUP */}
      {activeTab === 'PAYMENT_SETUP' && (
        <form onSubmit={handleSavePaymentConfig} className="space-y-8 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                🚀 PRODUCTION READY PAYMENT GATEWAY SETUP
              </span>
              <h3 className="font-serif text-2xl font-black text-brand-charcoal mt-1">
                Live Payment Gateways & Credentials Setup
              </h3>
              <p className="text-xs text-stone-500">Configure real Razorpay, Stripe, UPI Merchant VPA, and Cash on Delivery</p>
            </div>

            <button
              type="submit"
              disabled={savingPayment}
              className="bg-brand-terracotta hover:bg-brand-terracottaDark text-white font-extrabold text-xs px-7 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-all"
            >
              <Save size={16} />
              {savingPayment ? 'Saving Production Setup...' : 'Save & Deploy Payment Setup'}
            </button>
          </div>

          {paymentSavedMsg && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={18} className="text-emerald-700" />
              <span>{paymentSavedMsg}</span>
            </div>
          )}

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-charcoal text-brand-gold rounded-2xl">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-brand-charcoal">Gateway Environment Mode</h4>
                  <p className="text-xs text-stone-500">Switch between Live Real Money Processing or Test Simulation</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setPaymentConfig({ ...paymentConfig, environment: 'TEST' })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    paymentConfig.environment === 'TEST' 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  TEST SIMULATION
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentConfig({ ...paymentConfig, environment: 'LIVE' })}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    paymentConfig.environment === 'LIVE' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  🚀 LIVE PRODUCTION
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* RAZORPAY CONFIGURATION */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-stone-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-blue-600" size={22} />
                  <h4 className="font-serif font-bold text-base text-brand-charcoal">Razorpay Integration</h4>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={paymentConfig.razorpay?.enabled}
                    onChange={(e) => setPaymentConfig({
                      ...paymentConfig,
                      razorpay: { ...paymentConfig.razorpay, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 accent-brand-terracotta rounded"
                  />
                  Enable Razorpay
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Razorpay Key ID (Live / Test)</label>
                  <input
                    type="text"
                    required
                    placeholder="rzp_live_..."
                    value={paymentConfig.razorpay?.keyId || ''}
                    onChange={(e) => setPaymentConfig({
                      ...paymentConfig,
                      razorpay: { ...paymentConfig.razorpay, keyId: e.target.value }
                    })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none focus:border-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Razorpay Key Secret</label>
                  <input
                    type="password"
                    required
                    placeholder="Key Secret"
                    value={paymentConfig.razorpay?.keySecret || ''}
                    onChange={(e) => setPaymentConfig({
                      ...paymentConfig,
                      razorpay: { ...paymentConfig.razorpay, keySecret: e.target.value }
                    })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none focus:border-brand-terracotta"
                  />
                </div>
              </div>
            </div>

            {/* STRIPE CONFIGURATION */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-stone-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-purple-600" size={22} />
                  <h4 className="font-serif font-bold text-base text-brand-charcoal">Stripe Integration</h4>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={paymentConfig.stripe?.enabled}
                    onChange={(e) => setPaymentConfig({
                      ...paymentConfig,
                      stripe: { ...paymentConfig.stripe, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 accent-brand-terracotta rounded"
                  />
                  Enable Stripe
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Stripe Publishable Key</label>
                  <input
                    type="text"
                    required
                    placeholder="pk_live_..."
                    value={paymentConfig.stripe?.publishableKey || ''}
                    onChange={(e) => setPaymentConfig({
                      ...paymentConfig,
                      stripe: { ...paymentConfig.stripe, publishableKey: e.target.value }
                    })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none focus:border-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Stripe Secret Key</label>
                  <input
                    type="password"
                    required
                    placeholder="sk_live_..."
                    value={paymentConfig.stripe?.secretKey || ''}
                    onChange={(e) => setPaymentConfig({
                      ...paymentConfig,
                      stripe: { ...paymentConfig.stripe, secretKey: e.target.value }
                    })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none focus:border-brand-terracotta"
                  />
                </div>
              </div>
            </div>

            {/* LIVE UPI MERCHANT QR SETUP */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-stone-100">
                <div className="flex items-center gap-2">
                  <QrCode className="text-emerald-600" size={22} />
                  <h4 className="font-serif font-bold text-base text-brand-charcoal">Live UPI Merchant VPA ID</h4>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={paymentConfig.upi?.enabled}
                    onChange={(e) => setPaymentConfig({
                      ...paymentConfig,
                      upi: { ...paymentConfig.upi, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 accent-brand-terracotta rounded"
                  />
                  Enable UPI Instant Pay
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Merchant UPI VPA ID (e.g. brijeshwari@upi)</label>
                  <input
                    type="text"
                    required
                    placeholder="brijeshwari@upi or 9876543210@ybl"
                    value={paymentConfig.upi?.vpa || ''}
                    onChange={(e) => setPaymentConfig({
                      ...paymentConfig,
                      upi: { ...paymentConfig.upi, vpa: e.target.value }
                    })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none focus:border-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Merchant Business Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Brijeshwari Creations"
                    value={paymentConfig.upi?.merchantName || ''}
                    onChange={(e) => setPaymentConfig({
                      ...paymentConfig,
                      upi: { ...paymentConfig.upi, merchantName: e.target.value }
                    })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-brand-terracotta"
                  />
                </div>
              </div>
            </div>

            {/* CASH ON DELIVERY (COD) */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-stone-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-amber-600" size={22} />
                  <h4 className="font-serif font-bold text-base text-brand-charcoal">Cash on Delivery (COD)</h4>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={paymentConfig.cod?.enabled}
                    onChange={(e) => setPaymentConfig({
                      ...paymentConfig,
                      cod: { ...paymentConfig.cod, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 accent-brand-terracotta rounded"
                  />
                  Enable COD
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Minimum Order Amount for COD (₹)</label>
                  <input
                    type="number"
                    value={paymentConfig.cod?.minAmount || 0}
                    onChange={(e) => setPaymentConfig({
                      ...paymentConfig,
                      cod: { ...paymentConfig.cod, minAmount: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-brand-terracotta"
                  />
                </div>
              </div>
            </div>

          </div>

        </form>
      )}

      {/* TAB 6: ANALYTICS & METRICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-brand-borderTerracotta/60 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500 font-semibold">Total Orders</span>
                <h3 className="font-serif text-2xl font-black text-brand-charcoal mt-1">
                  {orders.length}
                </h3>
              </div>
              <div className="p-3 bg-brand-terracottaLight text-brand-terracotta rounded-xl">
                <ShoppingBag size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-borderTerracotta/60 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500 font-semibold">Categories Count</span>
                <h3 className="font-serif text-2xl font-black text-brand-charcoal mt-1">
                  {categoriesList.length} Categories
                </h3>
              </div>
              <div className="p-3 bg-rose-50 text-brand-terracotta rounded-xl">
                <Layers size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-borderTerracotta/60 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500 font-semibold">Products Catalog</span>
                <h3 className="font-serif text-2xl font-black text-brand-charcoal mt-1">
                  {productsList.length} Items
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <Package size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
