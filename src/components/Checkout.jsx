import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // ✅ USE SHARED AXIOS INSTANCE

function Checkout({ cart, setCart }) {
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

  /* -----------------------
     POLL FOR ADMIN CASH CODE
  ----------------------- */
  useEffect(() => {
    if (!pendingId) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`payment/cash/status/${pendingId}`);
        const data = res.data;

        // ✅ HANDLE ADMIN / CUSTOMER CANCELLATION
        if (data.status === "CANCELLED") {
          alert("Your cash payment request was cancelled.");
          setPendingId(null);
          setWaitingForAdmin(false);
          setCashCode("");
          clearInterval(interval);
          return;
        }

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

  /* -----------------------
     PLACE ORDER
  ----------------------- */
  const handlePlaceOrder = async () => {
    if (isPlacingOrder || pendingId) return;

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setIsPlacingOrder(true);

    try {
      if (paymentMethod === "gcash") {
        // --- GCASH FLOW ---
        const intentRes = await api.post("payment/intent", {
          amount: totalPrice * 100,
          currency: "PHP",
        });

        const intentId = intentRes.data.id;
        if (!intentId) throw new Error("Failed to create payment intent");

        const checkoutRes = await api.post("payment/checkout", {
          payment_intent_id: intentId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/cancel`,
          cart,
        });

        const checkoutUrl = checkoutRes.data.checkoutUrl;
        if (!checkoutUrl) throw new Error("Failed to create checkout session");

        window.location.href = checkoutUrl;

      } else if (paymentMethod === "cash") {
        // --- CASH FLOW ---
        const res = await api.post("payment/cash/start", { cart });

        setPendingId(res.data.pending_id);
        setWaitingForAdmin(true);
        alert("Cash payment requested. Waiting for admin approval.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  /* -----------------------
     CONFIRM CASH PAYMENT
  ----------------------- */
  const handleConfirmCash = async () => {
    if (!cashCode || !pendingId) {
      alert("Waiting for admin-generated cash code.");
      return;
    }

    try {
      const res = await api.post("payment/cash/confirm", {
        code: cashCode,
      });

      alert(res.data.message);
      setCart([]);
      localStorage.removeItem("cart");
      navigate("/success");
    } catch (err) {
      console.error(err);
      alert("Error confirming cash payment.");
    }
  };

  /* -----------------------
     CANCEL CASH PAYMENT (CUSTOMER)
  ----------------------- */
  const handleCancelCash = async () => {
    if (!pendingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this cash payment?"
    );
    if (!confirmed) return;

    try {
      await api.post(`payment/cash/cancel/${pendingId}`);
      alert("Cash payment cancelled.");
      setPendingId(null);
      setWaitingForAdmin(false);
      setCashCode("");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel cash payment.");
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
              <>
                <p className="text-warning">
                  Waiting for admin to generate your cash code…
                </p>

                {/* ✅ CUSTOMER CANCEL BUTTON */}
                <button
                  className="btn btn-outline-danger w-100 mb-3"
                  onClick={handleCancelCash}
                >
                  Cancel Cash Request
                </button>
              </>
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
