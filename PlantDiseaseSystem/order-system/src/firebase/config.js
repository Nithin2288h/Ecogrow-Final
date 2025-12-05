import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Updated Firebase config (orders & auth)
const firebaseConfig = {
  apiKey: "AIzaSyC6Hr6qQ8BL7aPAqC7vEEVUXsnUDC6VMNA",
  authDomain: "ecogrow-4d332.firebaseapp.com",
  databaseURL: "https://ecogrow-4d332-default-rtdb.firebaseio.com",
  projectId: "ecogrow-4d332",
  storageBucket: "ecogrow-4d332.firebasestorage.app",
  messagingSenderId: "484396454170",
  appId: "1:484396454170:web:d5e9f077ee6a3d2968dca3",
  measurementId: "G-2X2RTRZK69"
};

let app;
let db;
let auth;
let analytics;
let firebaseInitError = null;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  try {
    auth = getAuth(app);
    try {
      analytics = getAnalytics(app);
    } catch (aerr) {
      console.warn('Firebase analytics init warning:', aerr);
      analytics = null;
    }
  } catch (authError) {
    console.warn("Firebase Auth initialization warning:", authError);
    // Auth might not be configured, but continue with database
    auth = null;
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  firebaseInitError = error;
  // Fallback: try with empty config if needed
  if (!app) {
    try {
      app = initializeApp(firebaseConfig, "ecogrow-app");
      db = getDatabase(app);
      try {
        auth = getAuth(app);
        try {
          analytics = getAnalytics(app);
        } catch (aerr) {
          console.warn('Firebase analytics fallback warning:', aerr);
          analytics = null;
        }
      } catch (authError) {
        console.warn("Firebase Auth fallback warning:", authError);
        auth = null;
      }
    } catch (fallbackError) {
      console.error("Firebase fallback initialization error:", fallbackError);
      firebaseInitError = fallbackError;
      // Set defaults to prevent crashes
      db = null;
      auth = null;
    }
  }
}

export { db, auth, analytics, firebaseInitError };

