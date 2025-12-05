import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getConsumerOrders } from "../services/orderService";
import "./MyOrders.css";

const MyOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getConsumerOrders(currentUser.uid, (ordersList) => {
        setOrders(ordersList);
        setLoading(false);
      });
      
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#f44336";
      case "pending":
        return "#ff9800";
      default:
        return "#666";
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="page-header">
        <h1>📦 My Orders</h1>
        <p>Track your orders in real-time</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <a href="/crop-products" className="browse-link">
            Browse Products
          </a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="order-header">
                <div>
                  <h3 className="order-id">Order #{order.orderId.slice(0, 8)}</h3>
                  <p className="order-date">{formatDate(order.timestamp)}</p>
                </div>
                <div
                  className="order-status"
                  style={{ color: getStatusColor(order.status) }}
                >
                  {order.status.toUpperCase()}
                </div>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Product:</span>
                  <span className="detail-value">{order.productName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{order.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">
                    {order.quantity} {order.unit || "kg"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Price per unit:</span>
                  <span className="detail-value">₹{order.price}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Delivery Address:</span>
                  <span className="detail-value">{order.consumerAddress}</span>
                </div>
                <div className="detail-row total-row">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value total-amount">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

