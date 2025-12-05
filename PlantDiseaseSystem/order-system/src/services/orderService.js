import { ref, push, set, onValue, update } from "firebase/database";
import { db } from "../firebase/config";

// Create a new order
export const createOrder = async (orderData) => {
  const ordersRef = ref(db, "orders");
  const newOrderRef = push(ordersRef);
  
  const order = {
    orderId: newOrderRef.key,
    productId: orderData.productId,
    productName: orderData.productName,
    category: orderData.category,
    quantity: orderData.quantity,
    price: orderData.price,
    unit: orderData.unit || "kg",
    totalAmount: orderData.totalAmount,
    consumerId: orderData.consumerId,
    consumerName: orderData.consumerName,
    consumerAddress: orderData.consumerAddress,
    farmerId: orderData.farmerId || "default",
    status: "pending",
    timestamp: Math.floor(Date.now() / 1000)
  };
  
  await set(newOrderRef, order);
  return newOrderRef.key;
};

// Get all orders for a consumer (returns unsubscribe function)
export const getConsumerOrders = (consumerId, callback) => {
  // If database is not initialized, return empty list and noop unsubscribe
  if (!db) {
    callback([]);
    return () => {};
  }

  const ordersRef = ref(db, "orders");

  const unsubscribe = onValue(ordersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const orders = Object.keys(data)
        .map((key) => ({
          orderId: key,
          ...data[key]
        }))
        .filter((order) => order.consumerId === consumerId)
        .sort((a, b) => b.timestamp - a.timestamp);
      callback(orders);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};

// Get all orders for a farmer (returns unsubscribe function)
export const getFarmerOrders = (farmerId, callback) => {
  if (!db) {
    callback([]);
    return () => {};
  }

  const ordersRef = ref(db, "orders");

  const unsubscribe = onValue(ordersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const orders = Object.keys(data)
        .map((key) => ({
          orderId: key,
          ...data[key]
        }))
        .filter(
          (order) =>
            order.farmerId === farmerId || order.farmerId === "default"
        )
        .sort((a, b) => b.timestamp - a.timestamp);
      callback(orders);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  const orderRef = ref(db, `orders/${orderId}`);
  await update(orderRef, { status });
};

// Get single order by ID
export const getOrderById = (orderId, callback) => {
  if (!db) {
    callback(null);
    return () => {};
  }

  const orderRef = ref(db, `orders/${orderId}`);

  const unsubscribe = onValue(orderRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ orderId, ...snapshot.val() });
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};

