import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { checkAndInitializeProducts } from "./services/productService";
import Navigation from "./components/Navigation";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CropProducts from "./pages/CropProducts";
import MyOrders from "./pages/MyOrders";
import OrdersManagement from "./pages/OrdersManagement";
import "./App.css";

const AppContent = () => {
  useEffect(() => {
    // Initialize default products on first load
    try {
      checkAndInitializeProducts();
    } catch (error) {
      console.error("Error initializing products:", error);
    }
  }, []);

  return (
    <div className="App">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/crop-products" element={<CropProducts />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/orders-management" element={<OrdersManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  // Use basename for React Router to work with Flask
  const basename = process.env.PUBLIC_URL || '/order-system';
  
  return (
    <ErrorBoundary>
      <Router basename={basename}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
