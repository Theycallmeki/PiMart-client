import React from "react";
import { useNavigate } from "react-router-dom";

const Item = ({ cart, onQuantityChange, onDeleteItem }) => {
  const navigate = useNavigate();

  const grandTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div style={{ textAlign: "center", marginTop: "20px", padding: "0 10px" }}>
      <h2>🛒 Shopping Cart</h2>

      {cart.length === 0 ? (
        <p>No items in your cart yet.</p>
      ) : (
        <>
          {/* Table for larger screens */}
          <div className="cart-table">
            <table
              style={{
                margin: "0 auto",
                borderCollapse: "collapse",
                width: "100%",
                tableLayout: "fixed",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                borderRadius: "10px",
              }}
            >
              <thead style={{ background: "#f7f7f7" }}>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>Item</th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>Category</th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>Price</th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>Quantity</th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>Total</th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #ccc", padding: "6px" }}>{item.name}</td>
                    <td style={{ border: "1px solid #ccc", padding: "6px" }}>{item.category}</td>
                    <td style={{ border: "1px solid #ccc", padding: "6px" }}>
                      ₱{item.price.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "6px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <button
                          onClick={() =>
                            onQuantityChange(item.barcode, Math.max(1, item.quantity - 1))
                          }
                          style={{
                            background: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            width: "30px",
                            height: "30px",
                            cursor: "pointer",
                            fontSize: "18px",
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
                            width: "45px",
                            textAlign: "center",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            fontSize: "14px",
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
                            width: "30px",
                            height: "30px",
                            cursor: "pointer",
                            fontSize: "18px",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "6px" }}>
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "6px" }}>
                      <button
                        onClick={() => onDeleteItem(item.barcode)}
                        style={{
                          background: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          padding: "4px 6px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        🗑 Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards for mobile screens */}
          <div className="cart-cards">
            {cart.map((item, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "10px",
                  marginBottom: "15px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  textAlign: "left",
                }}
              >
                <h4>{item.name}</h4>
                <p>Category: {item.category}</p>
                <p>Price: ₱{item.price.toFixed(2)}</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginBottom: "5px",
                  }}
                >
                  <button
                    onClick={() =>
                      onQuantityChange(item.barcode, Math.max(1, item.quantity - 1))
                    }
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      width: "30px",
                      height: "30px",
                      cursor: "pointer",
                      fontSize: "18px",
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
                      width: "45px",
                      textAlign: "center",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      fontSize: "14px",
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
                      width: "30px",
                      height: "30px",
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                  >
                    +
                  </button>
                </div>
                <p>Total: ₱{(item.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => onDeleteItem(item.barcode)}
                  style={{
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "4px 6px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  🗑 Remove
                </button>
              </div>
            ))}
          </div>

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

      {/* Responsive CSS */}
      <style>
        {`
          /* Hide cards on large screens */
          .cart-cards {
            display: none;
          }
          /* Show table on large screens */
          .cart-table {
            display: block;
          }
          /* Mobile styles */
          @media (max-width: 768px) {
            .cart-table {
              display: none;
            }
            .cart-cards {
              display: block;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Item;
