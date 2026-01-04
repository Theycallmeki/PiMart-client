import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Checkout({ cart }) {
  const BACKEND_URL = "http://localhost:5000/payment"; // PayMongo backend
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [cashCode, setCashCode] = useState("");

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return alert("Your cart is empty!");

    if (paymentMethod === "gcash") {
      // 🟢 PayMongo GCash flow
      try {
        // Step 1: Create Payment Intent
        const intentRes = await fetch(`${BACKEND_URL}/intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalPrice * 100, currency: "PHP" }),
        });
        const intentData = await intentRes.json();
        console.log("Frontend: /intent response:", intentData);

        // 🔹 Update this check
        if (!intentData.id) throw new Error("Failed to create payment intent");

        const paymentIntentId = intentData.id;

        // Step 2: Create Checkout Session
        const checkoutRes = await fetch(`${BACKEND_URL}/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_intent_id: paymentIntentId,
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
            cart: cart
          }),
        });

        const checkoutData = await checkoutRes.json();
        if (!checkoutData.checkoutUrl) {
          console.error("PayMongo error:", checkoutData.error);
          throw new Error("Failed to create checkout session");
        }

        // Redirect to hosted checkout
        window.location.href = checkoutData.checkoutUrl;
      } catch (err) {
        console.error("Error during PayMongo checkout:", err);
        alert("Something went wrong during GCash payment.");
      }
    } else if (paymentMethod === "cash") {
      try {
        const res = await fetch(`${BACKEND_URL}/cash/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart })
        });

        if (!res.ok) throw new Error("Failed to generate cash code.");

        const data = await res.json(); // <-- get the backend response
        console.log("Generated cash code:", data.code);

        // Optional: prefill input for testing
        setCashCode(data.code);

        alert(`Your 6-digit cash code is: ${data.code}`);
      } catch (err) {
        console.error(err);
        alert("Failed to generate cash code.");
      }
    }
  };

  const handleConfirmCash = async () => {
    try {
      const res = await fetch("http://localhost:5000/payment/cash/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cashCode }),
        credentials: "include"
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Confirm failed");

      alert(data.message);
      setCashCode("");
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

        <button
          className="btn btn-primary w-100"
          onClick={handlePlaceOrder}
          disabled={paymentMethod === "cash" && cashCode} // disable if code exists
        >
          {paymentMethod === "gcash" ? "Pay with GCash" : cashCode ? "Cash Code Generated" : "Generate Cash Code"}
        </button>

      </div>
    </div>
  );
}

export default Checkout;
