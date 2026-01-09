import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Scanner from "./components/Scanner";
import Item from "./components/Item";
import Checkout from "./components/Checkout";
import BestSellers from "./components/BestSellers"; // ✅ Import Best Sellers Component
import Login from "./screens/auth/Login";
import Register from "./screens/auth/Register";
import "./App.css"; // ✅ Import the global background CSS
import Home from "./components/Home";

function Success() {
  React.useEffect(() => {
    localStorage.removeItem("cart");
  }, []);

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm">
        <h2>Payment Successful!</h2>
        <p>
          Your payment has been processed. You will receive a confirmation from
          GCash shortly.
        </p>
        <a href="/items" className="btn btn-primary mt-3">
          Back to Home
        </a>
      </div>
    </div>
  );
}

function App() {
  const [cart, setCart] = React.useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);


  // ✅ Add or update item when scanned
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.barcode === product.barcode
      );
      if (existingItem) {
        // If already in cart, increment quantity
        return prevCart.map((item) =>
          item.barcode === product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Otherwise, add new item
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // ✅ Change item quantity manually or via +/- buttons
  const handleQuantityChange = (barcode, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.barcode === barcode
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  // ✅ Remove item from cart
  const handleDeleteItem = (barcode) => {
    setCart((prevCart) => prevCart.filter((item) => item.barcode !== barcode));
  };

  return (
    <Router>
      {/* ✅ Animated Background */}
      <div className="background">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>


  <Routes>

  {/* 🏠 HOME (PUBLIC) */}
  <Route path="/" element={<Home />} />

  {/* 🔐 ITEMS */}
  <Route
    path="/items"
    element={
      <ProtectedRoute>
        <>
          <Header />
          <Item
            cart={cart}
            onQuantityChange={handleQuantityChange}
            onDeleteItem={handleDeleteItem}
          />
        </>
      </ProtectedRoute>
    }
  />

  {/* 🔐 SCANNER */}
  <Route
    path="/scanner"
    element={
      <ProtectedRoute>
        <>
          <Header />
          <Scanner
            cart={cart}
            onAddToCart={handleAddToCart}
            onQuantityChange={handleQuantityChange}
            onDeleteItem={handleDeleteItem}
          />
        </>
      </ProtectedRoute>
    }
  />

  {/* 🔐 CHECKOUT */}
  <Route
    path="/checkout"
    element={
      <ProtectedRoute>
        <>
          <Header />
          <Checkout cart={cart} setCart={setCart} />
        </>
      </ProtectedRoute>
    }
  />

  {/* 🔐 BEST SELLERS */}
  <Route
    path="/best"
    element={
      <ProtectedRoute>
        <>
          <Header />
          <BestSellers onAddToCart={handleAddToCart} />
        </>
      </ProtectedRoute>
    }
  />

  {/* 🔐 SUCCESS */}
  <Route
    path="/success"
    element={
      <ProtectedRoute>
        <Success />
      </ProtectedRoute>
    }
  />

  {/* 🔓 AUTH */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

</Routes>

    </Router>
  );
}

export default App;
