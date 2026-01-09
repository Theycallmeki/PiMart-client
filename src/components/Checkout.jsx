import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

function Checkout({ cart, setCart }) {
  const BACKEND_URL = "http://localhost:5000/payment";
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [cashCode, setCashCode] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [waitingForAdmin, setWaitingForAdmin] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  // -----------------------
  // POLL FOR ADMIN-GENERATED CASH CODE
  // -----------------------
  useEffect(() => {
    if (!pendingId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/cash/status/${pendingId}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.code) {
          setCashCode(data.code);
          setWaitingForAdmin(false);
          clearInterval(interval);
          alert(`Your cash code is: ${data.code}`);
        }
      } catch (err) {
        console.error("Failed to poll cash status", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pendingId]);

  // -----------------------
  // PLACE ORDER
  // -----------------------
  const handlePlaceOrder = async () => {
    if (isPlacingOrder || pendingId) return;

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
        // --- CASH FLOW (SECURE) ---
        const res = await fetch(`${BACKEND_URL}/cash/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ cart }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Cash request failed");

        setPendingId(data.pending_id);
        setWaitingForAdmin(true);
        alert("Cash payment requested. Waiting for admin approval.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to place order: " + err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // -----------------------
  // CONFIRM CASH PAYMENT
  // -----------------------
  const handleConfirmCash = async () => {
    if (!cashCode || !pendingId) {
      alert("Waiting for admin-generated cash code.");
      return;
    }

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
                  {item.name} (x{item.quantity})
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
            {waitingForAdmin && (
              <p className="text-warning">
                Waiting for admin to generate your cash code…
              </p>
            )}

            {cashCode && (
              <>
                <h5>Enter admin-provided cash code:</h5>
                <input
                  type="text"
                  className="form-control"
                  value={cashCode}
                  onChange={(e) => setCashCode(e.target.value)}
                  maxLength={6}
                />
                <button
                  className="btn btn-success mt-3 w-100"
                  onClick={handleConfirmCash}
                >
                  Confirm Cash Payment
                </button>
              </>
            )}
          </div>
        )}

        <button
          className="btn btn-primary w-100"
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || waitingForAdmin || pendingId}
        >
          {paymentMethod === "gcash"
            ? "Pay with GCash"
            : pendingId
            ? "Cash Payment Requested"
            : waitingForAdmin
            ? "Waiting for Admin Approval"
            : "Request Cash Payment"}
        </button>
      </div>
    </div>
  );
}

export default Checkout;
