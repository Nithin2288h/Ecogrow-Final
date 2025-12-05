import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/orderService";
import "./OrderModal.css";

const OrderModal = ({ product, isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update address when modal opens or user changes
  useEffect(() => {
    if (isOpen && currentUser?.address) {
      setAddress(currentUser.address);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!address.trim()) {
      setError("Please enter your address");
      setLoading(false);
      return;
    }

    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      setLoading(false);
      return;
    }

    try {
      const totalAmount = product.price * quantity;

      await createOrder({
        productId: product.productId,
        productName: product.name,
        category: product.category,
        quantity: quantity,
        price: product.price,
        unit: product.unit,
        totalAmount: totalAmount,
        consumerId: currentUser.uid,
        consumerName: currentUser.displayName || "Consumer",
        consumerAddress: address,
        farmerId: product.farmerId || "default"
      });

      onSuccess();
      onClose();
      setQuantity(1);
      setAddress(currentUser?.address || "");
    } catch (err) {
      setError("Failed to create order. Please try again.");
      console.error("Order creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    // Create placeholder image with product name
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    
    // Background
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(0, 0, 200, 200);
    
    // Text
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(product.name, 100, 100);
    
    e.target.src = canvas.toDataURL();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <h2>Place Order</h2>
        
        <div className="modal-product-info">
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={handleImageError}
            className="modal-product-image"
          />
          <div>
            <h3>{product.name}</h3>
            <p className="product-category">{product.category}</p>
            <p className="product-price">₹{product.price} / {product.unit}</p>
            <p className="product-description">{product.description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label htmlFor="quantity">Quantity ({product.unit}):</label>
            <input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Delivery Address:</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows="3"
              required
              placeholder="Enter your delivery address"
            />
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Price per {product.unit}:</span>
              <span>₹{product.price}</span>
            </div>
            <div className="summary-row">
              <span>Quantity:</span>
              <span>{quantity} {product.unit}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>₹{product.price * quantity}</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;

