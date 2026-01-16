import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Home from "./components/Home";
import Scanner from "./components/Scanner";
import Item from "./components/Item";
import Checkout from "./components/Checkout";
import BestSellers from "./components/BestSellers";
import Login from "./screens/auth/Login";
import Register from "./screens/auth/Register";
import "./App.css";

function Success() {
  React.useEffect(() => { localStorage.removeItem("cart"); }, []);

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm">
        <h2>Payment Successful!</h2>
        <p>Your payment has been processed. You will receive a confirmation from GCash shortly.</p>
        <a href="/items" className="btn btn-primary mt-3">Back to Home</a>
      </div>
    </div>
  );
}

function App() {
  const [cart, setCart] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("cart")) || []; }
    catch { return []; }
  });

  React.useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

  const handleAddToCart = (product) => setCart(prev =>
    prev.find(i => i.barcode === product.barcode)
      ? prev.map(i => i.barcode === product.barcode ? { ...i, quantity: i.quantity + 1 } : i)
      : [...prev, { ...product, quantity: 1 }]
  );

  const handleQuantityChange = (barcode, qty) =>
    setCart(prev => prev.map(i => i.barcode === barcode ? { ...i, quantity: Math.max(1, qty) } : i));

  const handleDeleteItem = (barcode) =>
    setCart(prev => prev.filter(i => i.barcode !== barcode));

  const ItemsRoute = <ProtectedRoute><Header /><Item cart={cart} onQuantityChange={handleQuantityChange} onDeleteItem={handleDeleteItem} /></ProtectedRoute>;
  const ScannerRoute = <ProtectedRoute><Header /><Scanner cart={cart} onAddToCart={handleAddToCart} onQuantityChange={handleQuantityChange} onDeleteItem={handleDeleteItem} /></ProtectedRoute>;
  const CheckoutRoute = <ProtectedRoute><Header /><Checkout cart={cart} setCart={setCart} /></ProtectedRoute>;
  const BestRoute = <ProtectedRoute><Header /><BestSellers onAddToCart={handleAddToCart} /></ProtectedRoute>;
  const SuccessRoute = <ProtectedRoute><Success /></ProtectedRoute>;

  return (
    <Router>
      <div className="background"><div className="wave" /><div className="wave" /><div className="wave" /></div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/items" element={ItemsRoute} />
        <Route path="/scanner" element={ScannerRoute} />
        <Route path="/checkout" element={CheckoutRoute} />
        <Route path="/best" element={BestRoute} />
        <Route path="/success" element={SuccessRoute} />
      </Routes>
    </Router>
  );
}

export default App;
