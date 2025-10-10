import React from "react";
import { useNavigate } from "react-router-dom";

const Item = ({ cart, onQuantityChange, onDeleteItem }) => {
  const navigate = useNavigate();

  const grandTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>🛒 Shopping Cart</h2>

      {cart.length === 0 ? (
        <p>No items in your cart yet.</p>
      ) : (
        <>
          <table
            style={{
              margin: "0 auto",
              borderCollapse: "collapse",
              width: "85%",
              maxWidth: "700px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <thead style={{ background: "#f7f7f7" }}>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Item</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Category</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Price</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Quantity</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Total</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.name}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.category}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    ₱{item.price.toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <button
                      onClick={() =>
                        onQuantityChange(item.barcode, Math.max(1, item.quantity - 1))
                      }
                      style={{
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "5px 8px",
                        cursor: "pointer",
                        marginRight: "5px",
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        onQuantityChange(item.barcode, parseInt(e.target.value) || 1)
                      }
                      style={{
                        width: "50px",
                        textAlign: "center",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                      }}
                    />
                    <button
                      onClick={() =>
                        onQuantityChange(item.barcode, item.quantity + 1)
                      }
                      style={{
                        background: "green",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "5px 8px",
                        cursor: "pointer",
                        marginLeft: "5px",
                      }}
                    >
                      +
                    </button>
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <button
                      onClick={() => onDeleteItem(item.barcode)}
                      style={{
                        background: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      🗑 Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginTop: "20px" }}>Grand Total: ₱{grandTotal.toFixed(2)}</h3>

          <button
            onClick={() => navigate("/checkout")}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              borderRadius: "6px",
              background: "blue",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
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
