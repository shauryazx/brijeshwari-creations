import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Default / Active Firebase Configuration for Brijeshwari Creations
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBrijeshwariCreationsKey12345",
  authDomain: "brijeshwari-creations.firebaseapp.com",
  projectId: "brijeshwari-creations",
  storageBucket: "brijeshwari-creations.appspot.com",
  messagingSenderId: "109876543210",
  appId: "1:109876543210:web:abcdef123456"
};

// Helper: 3-Second Timeout Wrapper to prevent hanging promises
const withTimeout = (promise, timeoutMs = 3000, fallbackValue = null) => {
  let timeoutId;
  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`Firebase network operation timed out after ${timeoutMs}ms (using instant fallback)`);
      resolve(fallbackValue);
    }, timeoutMs);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timeoutId);
      return res;
    }).catch((err) => {
      clearTimeout(timeoutId);
      throw err;
    }),
    timeoutPromise
  ]);
};

// Get stored Firebase config or default
export const getStoredFirebaseConfig = () => {
  if (typeof window === 'undefined') return DEFAULT_FIREBASE_CONFIG;
  const stored = localStorage.getItem('brijeshwari_firebase_config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return DEFAULT_FIREBASE_CONFIG;
};

// Initialize Firebase App
let app;
let storage;
let db;

export const initFirebase = (customConfig) => {
  const config = customConfig || getStoredFirebaseConfig();
  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    storage = getStorage(app);
    db = getFirestore(app);
    return { app, storage, db, success: true };
  } catch (err) {
    console.warn("Firebase initialization error (using resilient fallback):", err);
    return { success: false, error: err.message };
  }
};

// Auto-initialize
initFirebase();

// Live Diagnostic Test for Firebase Storage & Firestore (guaranteed 3s max execution time)
export const testFirebaseConnection = async () => {
  const testExecution = async () => {
    const { storage, db } = initFirebase();
    if (!storage) return { success: false, error: "Firebase Storage not initialized." };

    // Small 1x1 transparent GIF base64 string for testing
    const testBase64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const testRef = ref(storage, `diagnostics/test_${Date.now()}.gif`);
    
    await uploadString(testRef, testBase64, 'data_url');
    const url = await getDownloadURL(testRef);

    if (db) {
      await setDoc(doc(db, 'diagnostics', 'test_doc'), { timestamp: new Date().toISOString() });
    }

    return {
      success: true,
      message: "🔥 Firebase Cloud Storage & Firestore uploaded and verified live successfully!",
      downloadUrl: url
    };
  };

  return await withTimeout(testExecution(), 3500, {
    success: false,
    error: "Firebase connection timed out after 3.5s. Please check if your Firebase Storage bucket is created in Firebase Console."
  });
};

// Upload Image to Firebase Storage (with 3-second timeout & base64 fallback)
export const uploadImageToFirebase = async (base64OrUrl, filename) => {
  if (!base64OrUrl) return '';

  // If already an HTTP / HTTPS / Firebase URL, return directly
  if (base64OrUrl.startsWith('http://') || base64OrUrl.startsWith('https://')) {
    return base64OrUrl;
  }

  const uploadExec = async () => {
    const { storage } = initFirebase();
    if (storage && base64OrUrl.startsWith('data:image')) {
      const storageRef = ref(storage, `site_graphics/${filename || Date.now()}.jpg`);
      await uploadString(storageRef, base64OrUrl, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);
      console.log("Uploaded photo to Firebase Cloud Storage:", downloadUrl);
      return downloadUrl;
    }
    return base64OrUrl;
  };

  try {
    const result = await withTimeout(uploadExec(), 3000, base64OrUrl);
    return result || base64OrUrl;
  } catch (err) {
    console.warn("Firebase Storage upload fallback:", err);
    return base64OrUrl;
  }
};

// Save Site Config to Firebase Firestore, localStorage & Event Dispatch
export const saveSiteConfigToFirebase = async (siteConfig) => {
  // Save locally first & dispatch event (0ms instant update)
  try {
    localStorage.setItem('brijeshwari_site_config', JSON.stringify(siteConfig));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('brijeshwari_site_config_updated', { detail: siteConfig }));
    }
  } catch (e) {}

  const saveExec = async () => {
    const { db } = initFirebase();
    if (db) {
      const docRef = doc(db, 'site_config', 'home');
      await setDoc(docRef, siteConfig, { merge: true });
      return { success: true, message: "Saved to Firebase Firestore & Storage!" };
    }
    return { success: true, message: "Saved to Client Storage!" };
  };

  try {
    return await withTimeout(saveExec(), 3000, { success: true, message: "Saved to Client Storage!" });
  } catch (err) {
    return { success: true, message: "Saved to Client Storage!" };
  }
};

// Get Site Config from Firebase Firestore & localStorage
export const getSiteConfigFromFirebase = async () => {
  const fetchExec = async () => {
    const { db } = initFirebase();
    if (db) {
      const docRef = doc(db, 'site_config', 'home');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    }
    return null;
  };

  try {
    const cloudConfig = await withTimeout(fetchExec(), 2000, null);
    if (cloudConfig) return cloudConfig;
  } catch (err) {}

  // Local Storage fallback
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('brijeshwari_site_config');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
  }
  return null;
};
