import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

function Checkout({ cart, setCart }) {
  const BACKEND_URL = "http://localhost:5000/payment";
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [cashCode, setCashCode] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [codeTimer, setCodeTimer] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  useEffect(() => {
    if (codeTimer <= 0) return;
    const interval = setInterval(() => setCodeTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [codeTimer]);

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    if (cart.length === 0) {
      alert("Your cart is empty!");
      setIsPlacingOrder(false);
      return;
    }

    try {
      if (paymentMethod === "gcash") {
        // --- GCash flow ---
        const intentRes = await fetch(`${BACKEND_URL}/intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalPrice * 100, currency: "PHP" }),
        });
        const intentData = await intentRes.json();
        if (!intentData.id) throw new Error("Failed to create payment intent");

        const checkoutRes = await fetch(`${BACKEND_URL}/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_intent_id: intentData.id,
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
            cart,
          }),
        });
        const checkoutData = await checkoutRes.json();
        if (!checkoutData.checkoutUrl)
          throw new Error("Failed to create checkout session");

        window.location.href = checkoutData.checkoutUrl;

      } else if (paymentMethod === "cash") {
        // --- Cash flow ---
        // Step 1: create pending payment
        const res = await fetch(`${BACKEND_URL}/cash/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ cart }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Cash request failed");

        setPendingId(data.pending_id);

        // Step 2: immediately request code for customer
        const codeRes = await fetch(
          `${BACKEND_URL}/cash/request-code/${data.pending_id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const codeData = await codeRes.json();
        if (!codeRes.ok) throw new Error(codeData.error || "Failed to generate cash code");

        setCashCode(codeData.code);
        setCodeTimer(30); // start 30s countdown
        alert(`Cash request initiated. Your code: ${codeData.code}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to place order: " + err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleConfirmCash = async () => {
    if (!cashCode) return alert("Enter your 6-digit cash code.");

    try {
      const res = await fetch(`${BACKEND_URL}/cash/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cashCode }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Confirm failed");

      alert(data.message);
      setCart([]);
      localStorage.removeItem("cart");
      navigate("/success");
    } catch (err) {
      console.error(err);
      alert("Error confirming cash payment.");
    }
  };

  const handleRequestNewCode = async () => {
    if (!pendingId) return alert("No pending cash request.");

    try {
      const res = await fetch(`${BACKEND_URL}/cash/request-code/${pendingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request new code");

      setCashCode(data.code);
      setCodeTimer(30); // restart timer
      alert("New cash code requested.");
    } catch (err) {
      console.error(err);
      alert("Failed to request new cash code.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4">
        <button
          onClick={() => navigate("/items")}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            marginBottom: 16,
            color: "#113F67",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Back to Cart
        </button>

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
                  {item.name} (x{item.quantity}){" "}
                  <span>₱{item.price * item.quantity}</span>
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
            <div className="d-flex justify-content-between mt-2">
              <button className="btn btn-success" onClick={handleConfirmCash}>
                Confirm Cash Payment
              </button>
              <button className="btn btn-warning" onClick={handleRequestNewCode}>
                Request New Code
              </button>
            </div>
            {codeTimer > 0 && (
              <p className="mt-2 text-muted">Code expires in: {codeTimer}s</p>
            )}
          </div>
        )}

        <button
          className="btn btn-primary w-100"
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          {paymentMethod === "gcash"
            ? "Pay with GCash"
            : cashCode
            ? "Cash Code Entered"
            : "Request Cash Code"}
        </button>
      </div>
    </div>
  );
}

export default Checkout;
