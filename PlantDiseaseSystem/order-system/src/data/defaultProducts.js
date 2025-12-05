// Default products data structure
export const defaultProducts = {
  vegetables: [
    { name: "Tomato", price: 30, unit: "kg" },
    { name: "Potato", price: 25, unit: "kg" },
    { name: "Brinjal", price: 40, unit: "kg" },
    { name: "Carrot", price: 35, unit: "kg" },
    { name: "Onion", price: 28, unit: "kg" },
    { name: "Cabbage", price: 20, unit: "kg" },
    { name: "Cauliflower", price: 45, unit: "kg" },
    { name: "Capsicum", price: 50, unit: "kg" },
    { name: "Spinach", price: 30, unit: "kg" },
    { name: "Green Peas", price: 60, unit: "kg" },
    { name: "Bottle Gourd", price: 25, unit: "kg" },
    { name: "Bitter Gourd", price: 40, unit: "kg" },
    { name: "Radish", price: 20, unit: "kg" },
    { name: "Beetroot", price: 35, unit: "kg" }
  ],
  fruits: [
    { name: "Apple", price: 120, unit: "kg" },
    { name: "Banana", price: 40, unit: "kg" },
    { name: "Mango", price: 80, unit: "kg" },
    { name: "Orange", price: 60, unit: "kg" },
    { name: "Papaya", price: 30, unit: "kg" },
    { name: "Pineapple", price: 50, unit: "kg" },
    { name: "Grapes", price: 100, unit: "kg" },
    { name: "Watermelon", price: 25, unit: "kg" },
    { name: "Pomegranate", price: 150, unit: "kg" },
    { name: "Strawberry", price: 200, unit: "kg" },
    { name: "Guava", price: 40, unit: "kg" },
    { name: "Coconut", price: 30, unit: "piece" }
  ],
  millets: [
    { name: "Ragi", price: 50, unit: "kg" },
    { name: "Bajra", price: 35, unit: "kg" },
    { name: "Jowar", price: 40, unit: "kg" },
    { name: "Little Millet", price: 60, unit: "kg" },
    { name: "Kodo Millet", price: 55, unit: "kg" },
    { name: "Foxtail Millet", price: 50, unit: "kg" },
    { name: "Barnyard Millet", price: 45, unit: "kg" }
  ],
  grains: [
    { name: "Rice", price: 45, unit: "kg" },
    { name: "Wheat", price: 30, unit: "kg" },
    { name: "Maize", price: 25, unit: "kg" },
    { name: "Barley", price: 40, unit: "kg" },
    { name: "Oats", price: 60, unit: "kg" },
    { name: "Sorghum", price: 35, unit: "kg" }
  ]
};

// Helper function to get image URL
export const getProductImageUrl = (category, productName) => {
  // Prefer project-level crop images (served by Flask) when available.
  // Map certain product names to existing files under /static/images/crops
  const cropImageMap = {
    tomato: "/static/images/crops/tomato.jpeg",
    onion: "/static/images/crops/onion.jpeg",
    banana: "/static/images/crops/banana.jpeg",
    chilli: "/static/images/crops/chilli.jpeg",
    coriander: "/static/images/crops/coriander.jpeg",
    corn: "/static/images/crops/corn.jpeg",
    groundnut: "/static/images/crops/groundnut.jpeg",
    papaya: "/static/images/crops/papaya.jpeg",
    potato: "https://tse3.mm.bing.net/th/id/OIP.bTINhOqg4KhK9sUy4TV5PAHaEH?pid=Api&P=0&h=180",
    brinjal: "https://tse3.mm.bing.net/th/id/OIP.0pndoW7mwvqXLCzU_PsUcwHaFj?pid=Api&P=0&h=180",
    carrot: "https://tse1.mm.bing.net/th/id/OIP.Ak2_wlpxLPl2pos2tZvXLwHaDt?pid=Api&P=0&h=180",
    cabbage: "https://tse1.mm.bing.net/th/id/OIP.5nzXsxYo6k6ae19uR3LkrAHaE7?pid=Api&P=0&h=180",
    cauliflower: "https://tse4.mm.bing.net/th/id/OIP.BYrSy1O9PreiB4z4qUUCuwHaFj?pid=Api&P=0&h=180",
    capsicum: "https://tse2.mm.bing.net/th/id/OIP.FHF0hHUVh75x9NrT89Rp8gHaEK?pid=Api&P=0&h=180",
    spinach: "https://tse3.mm.bing.net/th/id/OIP.LAiDSADCqakUuZ9a2NSnHgHaE8?pid=Api&P=0&h=180",
    "green-peas": "https://tse4.mm.bing.net/th/id/OIP.L0XHCbQ3M72z-FQTLsK_TAHaE8?pid=Api&P=0&h=180",
    "bottle-gourd": "https://tse2.mm.bing.net/th/id/OIP.cmYT7C2ai-3i3VjH5VfREwHaFj?pid=Api&P=0&h=180",
    "bitter-gourd": "https://tse1.mm.bing.net/th/id/OIP.dJ-67xOToJOVtr8CNWDUrQHaEK?pid=Api&P=0&h=180",
    radish: "https://tse4.mm.bing.net/th/id/OIP.vvqw9I3LqnAveq2zD3rMfQHaE7?pid=Api&P=0&h=180",
    beetroot: "https://tse3.mm.bing.net/th/id/OIP.-syIRsWKuD75DWl9EIiTfAHaFS?pid=Api&P=0&h=180",
    apple: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTUshuJ5pq_Qn3RhB2FKXWNap5MYGl-JZZng&s",
    /* Fruits */
    mango: "https://tse1.mm.bing.net/th/id/OIP.b7z1RX4O1kEvdUuSjfJRqQHaE7?pid=Api&P=0&h=180",
    orange: "https://tse4.mm.bing.net/th/id/OIP.VbKz6SeSX9CQifygrVttcwHaE7?pid=Api&P=0&h=180",
    pineapple: "https://tse3.mm.bing.net/th/id/OIP.brl40H3vOq4GmZq3-u2GXAHaEo?pid=Api&P=0&h=180",
    grapes: "https://tse1.mm.bing.net/th/id/OIP._GTRDkh0bJzWlJWkoWBQEAHaEK?pid=Api&P=0&h=180",
    watermelon: "https://tse3.mm.bing.net/th/id/OIP.QR8RUkiS3HvN8Ox0hwcAFwHaEK?pid=Api&P=0&h=180",
    pomegranate: "https://tse4.mm.bing.net/th/id/OIP.Mcc2UuY4Re__unSNalAqRAHaE8?pid=Api&P=0&h=180",
    strawberry: "https://tse1.mm.bing.net/th/id/OIP.Qi9lvklJJr2hJ60tcrHE0wHaEo?pid=Api&P=0&h=180",
    guava: "https://tse4.mm.bing.net/th/id/OIP.tQXtjAq7ZOIu7_SxzyCKoQHaE8?pid=Api&P=0&h=180",
    coconut: "https://tse4.mm.bing.net/th/id/OIP.WgvNcJTy_EL8A7sCPCiAtQHaE7?pid=Api&P=0&h=180",
    /* Millets */
    ragi: "https://tse1.mm.bing.net/th/id/OIP.atFPQONWysoJZj6PRjGIiwHaEK?pid=Api&P=0&h=180",
    bajra: "https://tse3.mm.bing.net/th/id/OIP.Fp7QE6j2W4bJyFvzzjd-SQHaEJ?pid=Api&P=0&h=180",
    jowar: "https://tse1.mm.bing.net/th/id/OIP.7uxvR11_FHgbW0lwuTC-jAHaFE?pid=Api&P=0&h=180",
    "little-millet": "https://www.nutritionfact.in/wp-content/uploads/2023/04/Little-Millet.jpg",
    "kodo-millet": "https://tse1.mm.bing.net/th/id/OIP.PXKfhaCl09YsU5Z13KNDZQHaHa?pid=Api&P=0&h=180",
    "foxtail-millet": "https://tse4.mm.bing.net/th/id/OIP.RrhXOkZC-zAqQSF0938ESgHaE8?pid=Api&P=0&h=180",
    "barnyard-millet": "https://tse3.mm.bing.net/th/id/OIP.MyCLe9b5iwIIoTo1WM_89wHaE8?pid=Api&P=0&h=180",
    /* Grains */
    rice: "https://tse2.mm.bing.net/th/id/OIP.5-63kpNVtqTK7rOCTw4ZHQHaE8?pid=Api&P=0&h=180",
    wheat: "https://tse2.mm.bing.net/th/id/OIP.cCNuaNL88juTsN7rDTBOxQHaE8?pid=Api&P=0&h=180",
    maize: "https://tse3.mm.bing.net/th/id/OIP.gtN8sq98PGN2ZUwBHHdHJgHaE6?pid=Api&P=0&h=180",
    barley: "https://tse3.mm.bing.net/th/id/OIP.cieRGdK6O0z7BB4xZAfZyQHaHa?pid=Api&P=0&h=180",
    oats: "https://tse1.mm.bing.net/th/id/OIP.uZXm1ArztKtiPacs8Nk6BQHaEK?pid=Api&P=0&h=180",
    sorghum: "https://tse1.mm.bing.net/th/id/OIP.sVUY921q-Fpfr_12PTvcYQHaE8?pid=Api&P=0&h=180"
  };

  const key = productName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  // if exact mapping exists, return it
  if (cropImageMap[key]) return cropImageMap[key];

  // As a robust fallback, return a relevant online image using Unsplash's
  // dynamic image queries. This avoids missing images and gives a good
  // representative photo for each product name.
  // Example: https://source.unsplash.com/featured/?tomato
  try {
    const query = encodeURIComponent(productName);
    return `https://source.unsplash.com/featured/?${query}`;
  } catch (e) {
    // Last resort: fallback to original default-images path
    const categoryMap = {
      vegetables: "vegetables",
      fruits: "fruits",
      millets: "millets",
      grains: "grains"
    };
    const categoryPath = categoryMap[category.toLowerCase()] || category.toLowerCase();
    const imageName = productName.toLowerCase().replace(/\s+/g, "-");
    return `/default-images/${categoryPath}/${imageName}.jpg`;
  }
};

// Helper function to get description
export const getProductDescription = (name, category) => {
  return `Fresh organic ${name.toLowerCase()} from local farmers.`;
};

