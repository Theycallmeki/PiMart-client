import React from "react";
import { useNavigate } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";

const Item = ({ cart, onQuantityChange, onDeleteItem }) => {
  const navigate = useNavigate();

  const grandTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div style={{ textAlign: "center", marginTop: "20px", padding: "0 10px" }}>
      {/* Top-right navigation */}
<div
  style={{
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "10px",
  }}
>
  <button
    onClick={() => navigate("/scanner")}
    style={{
      background: "#113F67",
      color: "#FFFFFF",
      border: "none",
      borderRadius: "8px",
      padding: "8px 14px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "'Poppins', sans-serif",
    }}
  >
    ← Back to Scanner
  </button>
</div>

      <h2 style={{ fontSize: "20px", color: "white", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",}} ><CiShoppingCart />Shopping Cart</h2>

      {cart.length === 0 ? (
        <p style={{color:"white", fontFamily: "'Poppins', sans-serif", }}>No items in your cart yet.</p>
      ) : (
        <>
          <div className="cart-table">
            <table
              style={{
                margin: "0 auto",
                borderCollapse: "collapse",
                width: "100%",
                tableLayout: "fixed",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                borderRadius: "14px",
                backgroundColor: "#FFFFFF",
                fontFamily: "inherit",
              }}
            >
              <thead style={{ background: "#F1F5F9" }}>
                <tr>
                  <th style={{ border: "1px solid #CBD5E1", padding: "8px", color: "#113F67", fontWeight: 600, fontSize: "20px", }}>Item</th>
                  <th style={{ border: "1px solid #CBD5E1", padding: "8px", color: "#113F67", fontWeight: 600, fontSize: "20px", }}>Category</th>
                  <th style={{ border: "1px solid #CBD5E1", padding: "8px", color: "#113F67", fontWeight: 600, fontSize: "20px", }}>Price</th>
                  <th style={{ border: "1px solid #CBD5E1", padding: "8px", color: "#113F67", fontWeight: 600, fontSize: "20px", }}>Quantity</th>
                  <th style={{ border: "1px solid #CBD5E1", padding: "8px", color: "#113F67", fontWeight: 600, fontSize: "20px", }}>Total</th>
                  <th style={{ border: "1px solid #CBD5E1", padding: "8px", color: "#113F67", fontWeight: 600, fontSize: "20px",}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #E5E7EB", padding: "8px", color: "#374151", fontSize: "0.9rem", }}>{item.name}</td>
                    <td style={{ border: "1px solid #E5E7EB", padding: "8px", color: "#374151", fontSize: "0.9rem", }}>{item.category}</td>
                    <td style={{ border: "1px solid #E5E7EB", padding: "8px", color: "#374151", fontSize: "0.9rem", }}>
                      ₱{item.price.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #E5E7EB", padding: "8px", color: "#374151", fontSize: "0.9rem", }}>
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
                            background: "#9d0909",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            width: "32px",
                            height: "32px",
                            cursor: "pointer",
                            fontSize: "18px",
                            fontWeight: 600,
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
                            width: "48px",
                            textAlign: "center",
                            border: "1px solid #CBD5E1",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#113F67",
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
                    <td style={{ border: "1px solid #E5E7EB", padding: "8px", color: "#374151", fontSize: "0.9rem",}}>
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #E5E7EB", padding: "8px", color: "#374151", fontSize: "0.9rem", }}>
                      <button
                        onClick={() => onDeleteItem(item.barcode)}
                        style={{
                          background: "#9d0909",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 8px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
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
                   border: "1px solid #CBD5E1",
                    borderRadius: "14px",
                    padding: "14px",
                    marginBottom: "16px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    textAlign: "left",
                    backgroundColor: "#FFFFFF",
                    fontFamily: "'Poppins', sans-serif",
                }}
              >
                <h4>{item.name}</h4>
                <p style={{ color: "#374151", fontSize: "0.9rem" }}>Category: {item.category}</p>
                <p style={{ color: "#374151", fontSize: "0.9rem" }}>Price: ₱{item.price.toFixed(2)}</p>
                <div
                  style={{
                    color: "#113F67",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  <button
                    onClick={() =>
                      onQuantityChange(item.barcode, Math.max(1, item.quantity - 1))
                    }
                    style={{
                    background: "#9d0909",
                    color: "#FFFFFF",
                     border: "none",
                    borderRadius: "6px",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: 600,
                    fontFamily: "'Poppins', sans-serif",
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
                  width: "48px",
                  textAlign: "center",
                  border: "1px solid #CBD5E1",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#113F67",
                  fontFamily: "'Poppins', sans-serif",
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
                <p style={{ color: "#113F67", fontWeight: 600, fontSize: "0.95rem", fontFamily: "'Poppins', sans-serif", marginBottom: "8px", }}>Total: ₱{(item.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => onDeleteItem(item.barcode)}
                style={{
                background: "#9d0909",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
                }}
                >
                 Remove
                </button>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: "24px", color: "#FFFFFF", fontFamily: "'Poppins', sans-serif", fontSize: "20px" }}>Grand Total: ₱{grandTotal.toFixed(2)}</h3>

          <button
            onClick={() => navigate("/checkout")}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              borderRadius: "6px",
              background: "#4ba5f3ff",
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
