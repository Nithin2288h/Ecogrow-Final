# EcoGrow - Plant Disease System & Order Management

A comprehensive React application for managing crop products, orders, and connecting farmers with consumers. Built with Firebase Realtime Database for real-time synchronization.

## Features

### 🌾 Consumer Portal
- **Crop Products Page**: Browse products organized by categories (Vegetables, Fruits, Millets, Grains)
- **Order System**: Place orders with quantity and delivery address
- **My Orders Page**: View order history with real-time status updates

### 👨‍🌾 Farmer Portal
- **Orders Management**: View and manage all orders (pending, approved, rejected)
- **Accept/Reject Orders**: Update order status with instant real-time sync
- **Order Details**: View complete order information including consumer details

### 🔥 Firebase Realtime Database
- Automatic product initialization on first load
- Real-time order synchronization between consumer and farmer portals
- Live status updates without page refresh

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Firebase Configuration

The app uses Firebase Realtime Database with the following configuration:

```javascript
databaseURL: "https://ecogrow-fecd0-default-rtdb.firebaseio.com/"
```

## Database Structure

### Products
```
/products/{productId}
{
  name: string,
  category: "vegetable" | "fruit" | "millet" | "grain",
  price: number,
  unit: string,
  imageUrl: string,
  description: string,
  farmerId: string,
  timestamp: number
}
```

### Orders
```
/orders/{orderId}
{
  orderId: string,
  productId: string,
  productName: string,
  category: string,
  quantity: number,
  price: number,
  unit: string,
  totalAmount: number,
  consumerId: string,
  consumerName: string,
  consumerAddress: string,
  farmerId: string,
  status: "pending" | "approved" | "rejected",
  timestamp: number
}
```

## Default Products

The application automatically populates the database with default products on first load:

### Vegetables (14 items)
Tomato, Potato, Brinjal, Carrot, Onion, Cabbage, Cauliflower, Capsicum, Spinach, Green Peas, Bottle Gourd, Bitter Gourd, Radish, Beetroot

### Fruits (12 items)
Apple, Banana, Mango, Orange, Papaya, Pineapple, Grapes, Watermelon, Pomegranate, Strawberry, Guava, Coconut

### Millets (7 items)
Ragi, Bajra, Jowar, Little Millet, Kodo Millet, Foxtail Millet, Barnyard Millet

### Grains (6 items)
Rice, Wheat, Maize, Barley, Oats, Sorghum

## Default Images

Product images are stored in `/public/default-images/<category>/<product-name>.jpg`

If images are not available, the application automatically generates placeholder images with the product name.

## User Roles

### Consumer
- Browse and order products
- View order history
- Real-time order status updates

### Farmer
- View all orders (default products and assigned products)
- Accept or reject orders
- Real-time order management

Users can switch between consumer and farmer roles using the navigation bar.

## Project Structure

```
order-system/
├── public/
│   └── default-images/
│       ├── vegetables/
│       ├── fruits/
│       ├── millets/
│       └── grains/
├── src/
│   ├── components/
│   │   ├── Navigation.js
│   │   ├── OrderModal.js
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.js
│   ├── data/
│   │   └── defaultProducts.js
│   ├── firebase/
│   │   └── config.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── CropProducts.js
│   │   ├── MyOrders.js
│   │   └── OrdersManagement.js
│   ├── services/
│   │   ├── productService.js
│   │   └── orderService.js
│   ├── App.js
│   └── index.js
```

## Technologies Used

- **React 19.2.0**: UI framework
- **React Router DOM 6.21.1**: Routing
- **Firebase 10.7.1**: Realtime Database
- **CSS3**: Styling with modern gradients and responsive design

## Real-Time Features

- Products list updates in real-time
- Orders appear instantly in farmer portal when placed
- Order status updates instantly in consumer portal
- No page refresh required for any updates

## Development

The project uses Create React App. To build for production:

```bash
npm run build
```

## License

This project is part of the Plant Disease System.

