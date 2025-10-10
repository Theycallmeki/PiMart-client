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
      <style>{`
        table {
          width: 100%;
          border-collapse: collapse;
          max-width: 700px;
          margin: 0 auto;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          border-radius: 10px;
          overflow: hidden;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: center;
        }
        th {
          background: #f7f7f7;
        }
        button {
          cursor: pointer;
        }

        /* Responsive */
        @media (max-width: 768px) {
          table, thead, tbody, th, td, tr {
            display: block;
          }
          thead tr {
            display: none;
          }
          tr {
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 10px;
          }
          td {
            border: none;
            padding: 5px 10px;
            text-align: right;
            position: relative;
          }
          td::before {
            content: attr(data-label);
            position: absolute;
            left: 10px;
            font-weight: bold;
            text-align: left;
          }
          .quantity-controls {
            display: flex;
            justify-content: center;
            gap: 5px;
          }
          .grand-total {
            font-size: 1.2rem;
          }
          button {
            font-size: 14px;
            padding: 5px 8px;
          }
        }
      `}</style>

      <h2>🛒 Shopping Cart</h2>

      {cart.length === 0 ? (
        <p>No items in your cart yet.</p>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={index}>
                    <td data-label="Item">{item.name}</td>
                    <td data-label="Category">{item.category}</td>
                    <td data-label="Price">₱{item.price.toFixed(2)}</td>
                    <td data-label="Quantity">
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            onQuantityChange(
                              item.barcode,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          style={{ background: "red", color: "white", borderRadius: "5px" }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            onQuantityChange(
                              item.barcode,
                              parseInt(e.target.value) || 1
                            )
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
                          style={{ background: "green", color: "white", borderRadius: "5px" }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td data-label="Total">₱{(item.price * item.quantity).toFixed(2)}</td>
                    <td data-label="Action">
                      <button
                        onClick={() => onDeleteItem(item.barcode)}
                        style={{
                          background: "#6c757d",
                          color: "white",
                          borderRadius: "5px",
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

          <h3 className="grand-total" style={{ marginTop: "20px" }}>
            Grand Total: ₱{grandTotal.toFixed(2)}
          </h3>

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
