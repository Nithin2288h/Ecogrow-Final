import { ref, push, onValue, get } from "firebase/database";
import { db } from "../firebase/config";
import { defaultProducts, getProductImageUrl, getProductDescription } from "../data/defaultProducts";

// Check if products have been initialized
export const checkAndInitializeProducts = async () => {
  const productsRef = ref(db, "products");
  
  return new Promise((resolve) => {
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || Object.keys(data).length === 0) {
        // Initialize products
        initializeDefaultProducts().then(() => {
          resolve(true);
        });
      } else {
        resolve(false);
      }
    }, { onlyOnce: true });
  });
};

// Initialize default products
const initializeDefaultProducts = async () => {
  const timestamp = Math.floor(Date.now() / 1000);
  
  const allProducts = [];
  
  // Process vegetables
  defaultProducts.vegetables.forEach((product) => {
    allProducts.push({
      name: product.name,
      category: "vegetable",
      price: product.price,
      unit: product.unit,
      imageUrl: getProductImageUrl("vegetables", product.name),
      description: getProductDescription(product.name, "vegetable"),
      farmerId: "default",
      timestamp
    });
  });
  
  // Process fruits
  defaultProducts.fruits.forEach((product) => {
    allProducts.push({
      name: product.name,
      category: "fruit",
      price: product.price,
      unit: product.unit,
      imageUrl: getProductImageUrl("fruits", product.name),
      description: getProductDescription(product.name, "fruit"),
      farmerId: "default",
      timestamp
    });
  });
  
  // Process millets
  defaultProducts.millets.forEach((product) => {
    allProducts.push({
      name: product.name,
      category: "millet",
      price: product.price,
      unit: product.unit,
      imageUrl: getProductImageUrl("millets", product.name),
      description: getProductDescription(product.name, "millet"),
      farmerId: "default",
      timestamp
    });
  });
  
  // Process grains
  defaultProducts.grains.forEach((product) => {
    allProducts.push({
      name: product.name,
      category: "grain",
      price: product.price,
      unit: product.unit,
      imageUrl: getProductImageUrl("grains", product.name),
      description: getProductDescription(product.name, "grain"),
      farmerId: "default",
      timestamp
    });
  });
  
  // Add all products to Firebase
  for (const product of allProducts) {
    const productRef = ref(db, "products");
    await push(productRef, product);
  }
  
  console.log("Default products initialized successfully");
};

// Get all products (returns unsubscribe function)
export const getAllProducts = (callback) => {
  const productsRef = ref(db, "products");
  
  const unsubscribe = onValue(productsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Override stored imageUrl with a fresh URL from getProductImageUrl so
      // missing local images (from earlier initialization) won't show broken
      // images. This avoids rewriting the database and ensures cards always
      // have an image (local preferred, otherwise online Unsplash fallback).
      const pluralMap = { vegetable: 'vegetables', fruit: 'fruits', millet: 'millets', grain: 'grains' };
      const rawProducts = Object.keys(data).map((key) => {
        const item = data[key];
        const cat = (item.category || '').toLowerCase();
        const pluralCat = pluralMap[cat] || `${cat}s`;
        const imageUrl = getProductImageUrl(pluralCat, item.name || item.productName || 'product');
        return {
          productId: key,
          ...item,
          imageUrl
        };
      });

      // Deduplicate by normalized name+category to avoid duplicate DB entries
      // producing double cards in the UI. Keep the first occurrence.
      const seen = new Set();
      const products = [];
      for (const p of rawProducts) {
        const nameKey = (p.name || p.productName || '').toString().trim().toLowerCase();
        const catKey = (p.category || '').toString().trim().toLowerCase();
        const key = `${nameKey}|${catKey}`;
        if (!seen.has(key)) {
          seen.add(key);
          products.push(p);
        }
      }

      callback(products);
    } else {
      callback([]);
    }
  });
  
  return unsubscribe;
};

// Get products by category
export const getProductsByCategory = (category, callback) => {
  getAllProducts((products) => {
    const filtered = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
    callback(filtered);
  });
};

// Get single product by ID
export const getProductById = async (productId) => {
  const productRef = ref(db, `products/${productId}`);
  const snapshot = await get(productRef);
  if (snapshot.exists()) {
    return { productId, ...snapshot.val() };
  }
  return null;
};

