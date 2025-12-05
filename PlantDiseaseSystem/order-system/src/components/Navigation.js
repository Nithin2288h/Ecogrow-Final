import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navigation.css";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userType, switchUserType, currentUser, logout } = useAuth();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
            EcoGrow
        </Link>
        
        <div className="nav-links">
          {userType === "consumer" ? (
            <>
              <Link
                to="/crop-products"
                className={location.pathname === "/crop-products" ? "active" : ""}
                target="_blank"
                rel="noopener noreferrer"
              >
                Crop Products
              </Link>
              <Link
                to="/my-orders"
                className={location.pathname === "/my-orders" ? "active" : ""}
                target="_blank"
                rel="noopener noreferrer"
              >
                My Orders
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/orders-management"
                className={location.pathname === "/orders-management" ? "active" : ""}
                target="_blank"
                rel="noopener noreferrer"
              >
                Orders Management
              </Link>
            </>
          )}
        </div>

        <div className="nav-user">
          {currentUser ? (
            <>
              <span className="user-name">{currentUser?.displayName || "User"}</span>
              <button
                className="switch-user-btn"
                onClick={() => switchUserType(userType === "consumer" ? "farmer" : "consumer")}
              >
                Switch to {userType === "consumer" ? "Farmer" : "Consumer"}
              </button>
              <button
                className="logout-btn"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-link">
              Login / Signup
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

