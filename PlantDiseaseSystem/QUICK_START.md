# 🚀 Quick Start Guide - EcoGrow Project

## ✅ Servers Started

Both servers are now running:

1. **Flask Server** (Port 5000)
   - URL: http://127.0.0.1:5000/
   - Main website with all features

2. **React Order System** (Port 3000)
   - URL: http://localhost:3000/
   - Order management system

## 🌐 Access Points

### Main Website (Flask)
- **Home Page**: http://127.0.0.1:5000/
- **Plant Disease Detection**: http://127.0.0.1:5000/plant-disease
- **Crop Guidance**: http://127.0.0.1:5000/homeguide
- **Weather**: http://127.0.0.1:5000/static/weather/weather.html
- **Profit Estimator**: http://127.0.0.1:5000/profit
- **Fertilizers & Pesticides**: http://127.0.0.1:5000/fertilizers
- **User Needs (Old Order)**: http://127.0.0.1:5000/order

### New Order System (React)
- **Home**: http://localhost:3000/
- **Login/Signup**: http://localhost:3000/login
- **Crop Products**: http://localhost:3000/crop-products
- **My Orders**: http://localhost:3000/my-orders
- **Orders Management**: http://localhost:3000/orders-management

## 🎯 Quick Navigation

### From Flask Home Page:
1. Click **"🛒 Crop Products & Orders"** → Opens React order system
2. Click **"👤 Login / Signup"** → Opens login page
3. Click **"🛒 Order System"** in navbar → Opens React order system

### Features Available:
- ✅ Plant Disease Detection
- ✅ Crop Guidance
- ✅ Weather Information
- ✅ Profit Estimator
- ✅ Fertilizers & Pesticides
- ✅ **NEW: Crop Products & Orders**
- ✅ **NEW: Login/Signup System**
- ✅ **NEW: Real-time Order Management**

## 🔐 First Time Setup

1. **Create an Account:**
   - Go to http://localhost:3000/login
   - Click "Sign Up"
   - Fill in your details
   - Select account type (Consumer or Farmer)
   - Click "Sign Up"

2. **Browse Products:**
   - After login, go to "Crop Products"
   - Browse by category (Vegetables, Fruits, Millets, Grains)
   - Click "Order Now" to place an order

3. **Manage Orders:**
   - Consumers: View orders in "My Orders"
   - Farmers: Manage orders in "Orders Management"

## ⚠️ Important Notes

1. **Firebase Authentication Setup:**
   - For login/signup to work, enable Email/Password in Firebase Console
   - Go to: https://console.firebase.google.com/
   - Project: `ecogrow-fecd0`
   - Authentication → Sign-in method → Enable Email/Password

2. **Both Servers Must Run:**
   - Flask: Port 5000
   - React: Port 3000

3. **Products Auto-Initialize:**
   - Products are automatically added on first load
   - 39 default products across 4 categories

## 🛑 Stopping Servers

To stop the servers:
- Press `Ctrl+C` in the terminal windows
- Or close the terminal windows

## 🐛 Troubleshooting

### Servers Not Starting?
- Check if ports 5000 and 3000 are available
- Make sure Python and Node.js are installed
- Check terminal for error messages

### Login Not Working?
- Enable Email/Password in Firebase Console
- Check browser console for errors
- Verify Firebase configuration

### Products Not Showing?
- Check Firebase Realtime Database
- Products auto-initialize on first load
- Check browser console for errors

## 📞 Need Help?

Check the following files:
- `INTEGRATION_COMPLETE.md` - Full integration details
- `order-system/README.md` - React app documentation
- `order-system/ERRORS_FIXED.md` - Error fixes

Enjoy your EcoGrow platform! 🌱

