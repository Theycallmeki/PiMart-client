// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Scanner from "./components/Scanner";
import Item from "./components/Item";
import Checkout from "./components/Checkout";
import BestSellers from "./components/BestSellers"; // ✅ Import Best Sellers Component

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
        <a href="/" className="btn btn-primary mt-3">
          Back to Home
        </a>
      </div>
    </div>
  );
}

function App() {
  const [cart, setCart] = React.useState([]);

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
      <Header />
      <Routes>
        {/* ✅ Scanner Page */}
        <Route
          path="/scanner"
          element={
            <Scanner
              cart={cart}
              onAddToCart={handleAddToCart}
              onQuantityChange={handleQuantityChange}
              onDeleteItem={handleDeleteItem}
            />
          }
        />

        {/* ✅ Cart / Item Page */}
        <Route
          path="/"
          element={
            <Item
              cart={cart}
              onQuantityChange={handleQuantityChange}
              onDeleteItem={handleDeleteItem}
            />
          }
        />

        {/* ✅ Checkout Page */}
        <Route path="/checkout" element={<Checkout cart={cart} />} />

        {/* ✅ Success Page */}
        <Route path="/success" element={<Success />} />

        {/* ✅ AI Best Seller Predictor Page */}
        <Route path="/best" element={<BestSellers onAddToCart={handleAddToCart} />} />
      </Routes>
    </Router>
  );
}

export default App;
