import React, { useState, useEffect } from "react";
import { getAllProducts } from "../services/productService";
import OrderModal from "../components/OrderModal";
import "./CropProducts.css";

const CropProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getAllProducts((productsList) => {
      setProducts(productsList);
      setFilteredProducts(productsList);
      setLoading(false);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter(
          (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }
  }, [selectedCategory, products]);

  const categories = [
    { id: "all", name: "All Products" },
    { id: "vegetable", name: "Vegetables" },
    { id: "fruit", name: "Fruits" },
    { id: "millet", name: "Millets" },
    { id: "grain", name: "Grains" }
  ];

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleImageError = (e, productName) => {
    // Create placeholder image
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    
    // Background
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(0, 0, 300, 300);
    
    // Text
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(productName, 150, 150);
    
    e.target.src = canvas.toDataURL();
  };

  const groupedProducts = categories
    .filter((cat) => cat.id !== "all")
    .map((category) => {
      const categoryProducts = filteredProducts.filter(
        (p) => p.category.toLowerCase() === category.id.toLowerCase()
      );
      return { category, products: categoryProducts };
    })
    .filter((group) => group.products.length > 0);

  return (
    <div className="crop-products-page">
      <div className="page-header">
        <h1>Crop Products</h1>
        <p>Browse and order fresh organic products from local farmers</p>
      </div>

      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-filter ${selectedCategory === category.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <>
          {selectedCategory === "all" ? (
            <div className="products-by-category">
              {groupedProducts.map((group) => (
                <div key={group.category.id} className="category-section">
                  <h2 className="category-title">{group.category.name}</h2>
                  <div className="products-grid">
                    {group.products.map((product) => (
                      <div key={product.productId} className="product-card">
                        <div className="product-image-container">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            onError={(e) => handleImageError(e, product.name)}
                            className="product-image"
                          />
                        </div>
                        <div className="product-info">
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-category">{product.category}</p>
                          <p className="product-price">
                            ₹{product.price} / {product.unit}
                          </p>
                          <p className="product-description">
                            {product.description}
                          </p>
                          <button
                            className="order-btn"
                            onClick={() => handleOrderClick(product)}
                          >
                            Order Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.productId} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      onError={(e) => handleImageError(e, product.name)}
                      className="product-image"
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">
                      ₹{product.price} / {product.unit}
                    </p>
                    <p className="product-description">{product.description}</p>
                    <button
                      className="order-btn"
                      onClick={() => handleOrderClick(product)}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && !loading && (
            <div className="no-products">
              No products found in this category.
            </div>
          )}
        </>
      )}

      <OrderModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Order placed successfully
          console.log("Order placed successfully");
        }}
      />
    </div>
  );
};

export default CropProducts;

