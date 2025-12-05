import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firebaseInitError } from "../firebase/config";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null); // "consumer" or "farmer"
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(firebaseInitError ? (firebaseInitError.message || String(firebaseInitError)) : null);

  useEffect(() => {
    // Listen for auth state changes
    let unsubscribe;
    
    try {
      if (auth) {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // User is signed in
            const storedUser = localStorage.getItem(`user_${user.uid}`);
            const storedUserType = localStorage.getItem(`userType_${user.uid}`);
            
            if (storedUser) {
              setCurrentUser(JSON.parse(storedUser));
              setUserType(storedUserType || "consumer");
            } else {
              // Create user data from Firebase user
              const userData = {
                uid: user.uid,
                displayName: user.displayName || user.email?.split("@")[0] || "User",
                email: user.email,
                address: ""
              };
              setCurrentUser(userData);
              setUserType("consumer");
              localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));
              localStorage.setItem(`userType_${user.uid}`, "consumer");
            }
          } else {
            // User is signed out
            setCurrentUser(null);
            setUserType(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Auth state change error:", error);
          setAuthError(error?.message || String(error));
          // Continue without auth if Firebase fails
          setCurrentUser(null);
          setUserType(null);
          setLoading(false);
        });
      } else {
        // No auth available, continue without it
        setLoading(false);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      // Continue without auth if Firebase fails
      setCurrentUser(null);
      setUserType(null);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = (userData, type) => {
    setCurrentUser(userData);
    setUserType(type);
    if (userData.uid) {
      localStorage.setItem(`user_${userData.uid}`, JSON.stringify(userData));
      localStorage.setItem(`userType_${userData.uid}`, type);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserType(null);
      // Clear all user data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_') || key.startsWith('userType_')) {
          localStorage.removeItem(key);
        }
      });
      // Redirect to login page
      window.location.href = "/order-system/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = (userData) => {
    setCurrentUser(userData);
    if (userData.uid) {
      localStorage.setItem(`user_${userData.uid}`, JSON.stringify(userData));
    }
  };

  const switchUserType = (type) => {
    setUserType(type);
    if (currentUser?.uid) {
      localStorage.setItem(`userType_${currentUser.uid}`, type);
    }
  };

  const value = {
    currentUser,
    userType,
    loading,
    login,
    logout,
    updateUser,
    switchUserType
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If Firebase auth initialization produced an error, show a clear message
  if (authError) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Authentication initialization error</h2>
        <p>{authError}</p>
        <p>Please verify your Firebase configuration (API key, project ID) and enable Email/Password authentication in the Firebase Console.</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

