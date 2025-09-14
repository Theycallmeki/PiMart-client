import React from "react";
import { useNavigate } from "react-router-dom";

const Item = ({ cart, onQuantityChange }) => {
  const navigate = useNavigate();

  // Calculate total of all items
  const grandTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>🛒 Shopping Cart</h2>
      {cart.length === 0 ? (
        <p>No items scanned yet.</p>
      ) : (
        <>
          <table
            style={{
              margin: "0 auto",
              borderCollapse: "collapse",
              width: "80%",
              maxWidth: "600px",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Item</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Category</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Price</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Quantity</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.name}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.category}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>₱{item.price}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        onQuantityChange(item.id, parseInt(e.target.value))
                      }
                      style={{ width: "60px", textAlign: "center" }}
                    />
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    ₱{item.price * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Display Grand Total */}
          <h3 style={{ marginTop: "15px" }}>Grand Total: ₱{grandTotal}</h3>

          {/* Navigate using React Router */}
          <button
            onClick={() => navigate("/checkout")}
            style={{
              marginTop: "10px",
              padding: "10px 15px",
              borderRadius: "5px",
              background: "green",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default Item;