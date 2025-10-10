import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Checkout({ cart }) {
  const BACKEND_URL = "http://localhost:3005/api/sales-history";
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [cashCode, setCashCode] = useState("");

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return alert("Your cart is empty!");

    if (paymentMethod === "gcash") {
      try {
        const res = await fetch(`${BACKEND_URL}/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart }),
        });

        const data = await res.json();
        if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      } catch (err) {
        console.error("Error during checkout:", err);
        alert("Something went wrong.");
      }
    } else if (paymentMethod === "cash") {
      try {
        const res = await fetch(`${BACKEND_URL}/save-cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart }),
        });

        if (!res.ok) throw new Error("Failed to send cart.");

        alert("Please ask the admin for your 6-digit cash code.");
      } catch (err) {
        console.error(err);
        alert("Failed to send cart to admin.");
      }
    }
  };

  const handleConfirmCash = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/confirm-cash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cashCode }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setCashCode("");
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error confirming cash payment.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4">
        <h2 className="mb-4">Checkout</h2>

        <div className="mb-4">
          <h5>Your Items:</h5>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <ul className="list-group mb-3">
              {cart.map((item) => (
                <li
                  key={item.barcode}
                  className="list-group-item d-flex justify-content-between"
                >
                  {item.name} (x{item.quantity})
                  <span>₱{Number(item.price) * item.quantity}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="fw-bold">Total: ₱{totalPrice}</p>
        </div>

        <div className="mb-4">
          <h5>Payment Method:</h5>
          <select
            className="form-control"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="gcash">GCash</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        {paymentMethod === "cash" && (
          <div className="mb-3">
            <h5>Enter 6-digit cash code (provided by admin):</h5>
            <input
              type="text"
              className="form-control"
              value={cashCode}
              onChange={(e) => setCashCode(e.target.value)}
              maxLength={6}
            />
            <button
              className="btn btn-success mt-2 w-100"
              onClick={handleConfirmCash}
            >
              Confirm Cash Payment
            </button>
          </div>
        )}

        <button className="btn btn-primary w-100" onClick={handlePlaceOrder}>
          {paymentMethod === "gcash" ? "Pay with GCash" : "Generate Cash Code"}
        </button>
      </div>
    </div>
  );
}

export default Checkout;
