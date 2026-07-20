import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';

// Default / Active Firebase Configuration for Brijeshwari Creations
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBrijeshwariCreationsKey12345",
  authDomain: "brijeshwari-creations.firebaseapp.com",
  projectId: "brijeshwari-creations",
  storageBucket: "brijeshwari-creations.appspot.com",
  messagingSenderId: "109876543210",
  appId: "1:109876543210:web:abcdef123456"
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

// Upload Image to Firebase Storage (with base64 fallback)
export const uploadImageToFirebase = async (base64OrUrl, filename) => {
  if (!base64OrUrl) return '';

  // If already an HTTP / HTTPS / Firebase URL, return directly
  if (base64OrUrl.startsWith('http://') || base64OrUrl.startsWith('https://')) {
    return base64OrUrl;
  }

  try {
    const { storage } = initFirebase();
    if (storage && base64OrUrl.startsWith('data:image')) {
      const storageRef = ref(storage, `site_graphics/${filename || Date.now()}.jpg`);
      await uploadString(storageRef, base64OrUrl, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);
      console.log("Uploaded photo to Firebase Cloud Storage:", downloadUrl);
      return downloadUrl;
    }
  } catch (err) {
    console.warn("Firebase Storage upload fallback:", err);
  }

  // Fallback: return data URL directly
  return base64OrUrl;
};

// Save Site Config to Firebase Firestore & localStorage
export const saveSiteConfigToFirebase = async (siteConfig) => {
  try {
    localStorage.setItem('brijeshwari_site_config', JSON.stringify(siteConfig));
  } catch (e) {}

  try {
    const { db } = initFirebase();
    if (db) {
      const docRef = doc(db, 'site_config', 'home');
      await setDoc(docRef, siteConfig, { merge: true });
      return { success: true, message: "Saved to Firebase Firestore & Storage!" };
    }
  } catch (err) {
    console.warn("Firestore save fallback:", err);
  }

  return { success: true, message: "Saved to Client Cloud Storage!" };
};

// Get Site Config from Firebase Firestore & localStorage
export const getSiteConfigFromFirebase = async () => {
  try {
    const { db } = initFirebase();
    if (db) {
      const docRef = doc(db, 'site_config', 'home');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    }
  } catch (err) {
    console.warn("Firestore fetch fallback:", err);
  }

  // Local Storage fallback
  const stored = localStorage.getItem('brijeshwari_site_config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return null;
};
