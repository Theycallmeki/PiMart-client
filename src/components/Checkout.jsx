import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Checkout({ cart }) {
  const BACKEND_URL = "http://localhost:3005/api/sales-history";

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

    const handlePlaceOrder = async () => {
      if (cart.length === 0) return alert("Your cart is empty!");

      try {
        const res = await fetch(`${BACKEND_URL}/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart }),
        });

        const data = await res.json();
          if (data.checkoutUrl) {window.location.href = data.checkoutUrl;}

                     
      } catch (err) {
        console.error("Error during checkout:", err);
        alert("Something went wrong.");
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
          <input type="text" className="form-control" value="GCash" readOnly />
        </div>

        <button className="btn btn-primary w-100" onClick={handlePlaceOrder}>
          Pay with GCash
        </button>
      </div>
    </div>
  );
}

export default Checkout;
