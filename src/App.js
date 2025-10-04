// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Scanner from "./components/Scanner";
import Item from "./components/Item";
import Checkout from "./components/Checkout";

function Success() {
  React.useEffect(() => {
    localStorage.removeItem("cart");
  }, []);

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm">
        <h2>Payment Successful!</h2>
        <p>Your payment has been processed. You will receive a confirmation from GCash shortly.</p>
        <a href="/" className="btn btn-primary mt-3">
          Back to Home
        </a>
      </div>
    </div>
  );
}

function App() {
  const [cart, setCart] = React.useState([]);

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.barcode === product.barcode
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.barcode === product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (barcode, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.barcode === barcode ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/scanner"
          element={<Scanner onAddToCart={handleAddToCart} />}
        />
        <Route
          path="/"
          element={<Item cart={cart} onQuantityChange={handleQuantityChange} />}
        />
        <Route path="/checkout" element={<Checkout cart={cart} />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </Router>
  );
}

export default App;