import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const Home = () => {
  const { userType } = useAuth();

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to EcoGrow</h1>
        <p className="hero-subtitle">
          Connect directly with farmers and get fresh, organic produce delivered to your doorstep
        </p>
        
        <div className="hero-actions">
          {userType === "consumer" ? (
            <Link to="/crop-products" className="cta-button" target="_blank" rel="noopener noreferrer">
              Browse Products
            </Link>
          ) : (
            <Link to="/orders-management" className="cta-button" target="_blank" rel="noopener noreferrer">
              Manage Orders
            </Link>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <h3>Fresh Products</h3>
          <p>Get the freshest organic produce directly from local farmers</p>
        </div>
        
        <div className="feature-card">
          <h3>Fast Delivery</h3>
          <p>Quick and reliable delivery service to your doorstep</p>
        </div>
        
        <div className="feature-card">
          <h3>Eco-Friendly</h3>
          <p>Support sustainable farming and eco-friendly practices</p>
        </div>
        
        <div className="feature-card">
          <h3>Real-Time Updates</h3>
          <p>Track your orders with real-time status updates</p>
        </div>
      </div>

      {userType === "consumer" && (
        <div className="quick-links">
          <Link to="/crop-products" className="quick-link" target="_blank" rel="noopener noreferrer">
            View All Products →
          </Link>
          <Link to="/my-orders" className="quick-link" target="_blank" rel="noopener noreferrer">
            My Orders →
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;

