import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getFarmerOrders, updateOrderStatus } from "../services/orderService";
import "./OrdersManagement.css";

const OrdersManagement = () => {
  const { currentUser, loading: authLoading, userType } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(null);

  useEffect(() => {
    // If auth is still initializing, keep the page-level loading until it's done
    if (authLoading) return;

    // If there's no authenticated user or the user is not a farmer, show no orders
    if (!currentUser || userType !== "farmer") {
      setOrders([]);
      setLoading(false);
      return;
    }

    const unsubscribe = getFarmerOrders(currentUser.uid, (ordersList) => {
      setOrders(ordersList);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const handleStatusUpdate = async (orderId, status) => {
    setProcessingOrder(orderId);
    try {
      await updateOrderStatus(orderId, status);
      // The real-time listener will automatically update the orders
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    } finally {
      setProcessingOrder(null);
    }
  };

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

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const processedOrders = orders.filter((order) => order.status !== "pending");

  if (loading) {
    return (
      <div className="orders-management-page">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="orders-management-page">
      <div className="page-header">
        <h1>📋 Orders Management</h1>
        <p>Manage and process customer orders in real-time</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          {(!currentUser) ? (
            <p>Please sign in as a farmer to view orders.</p>
          ) : (userType !== "farmer") ? (
            <p>Orders are visible to farmer accounts only. Switch to a farmer account to view.</p>
          ) : (
            <p>No orders available at the moment.</p>
          )}
        </div>
      ) : (
        <>
          {pendingOrders.length > 0 && (
            <div className="orders-section">
              <h2 className="section-title">
                Pending Orders ({pendingOrders.length})
              </h2>
              <div className="orders-list">
                {pendingOrders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onApprove={() => handleStatusUpdate(order.orderId, "approved")}
                    onReject={() => handleStatusUpdate(order.orderId, "rejected")}
                    processing={processingOrder === order.orderId}
                    getStatusColor={getStatusColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {processedOrders.length > 0 && (
            <div className="orders-section">
              <h2 className="section-title">
                Processed Orders ({processedOrders.length})
              </h2>
              <div className="orders-list">
                {processedOrders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    getStatusColor={getStatusColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const OrderCard = ({
  order,
  onApprove,
  onReject,
  processing,
  getStatusColor,
  formatDate
}) => {
  return (
    <div className="order-card">
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
        <div className="detail-section">
          <h4>Product Information</h4>
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
            <span className="detail-value">{order.quantity} {order.unit || "kg"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Price per unit:</span>
            <span className="detail-value">₹{order.price}</span>
          </div>
          <div className="detail-row total-row">
            <span className="detail-label">Total Amount:</span>
            <span className="detail-value total-amount">₹{order.totalAmount}</span>
          </div>
        </div>

        <div className="detail-section">
          <h4>Consumer Information</h4>
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{order.consumerName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Address:</span>
            <span className="detail-value">{order.consumerAddress}</span>
          </div>
        </div>
      </div>

      {order.status === "pending" && onApprove && onReject && (
        <div className="order-actions">
          <button
            className="btn-reject"
            onClick={onReject}
            disabled={processing}
          >
            {processing ? "Processing..." : "Reject"}
          </button>
          <button
            className="btn-approve"
            onClick={onApprove}
            disabled={processing}
          >
            {processing ? "Processing..." : "Accept"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;

