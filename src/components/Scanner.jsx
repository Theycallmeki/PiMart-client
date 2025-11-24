// Scanner.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const Scanner = ({ cart, onAddToCart, onQuantityChange, onDeleteItem }) => {
  const videoRef = useRef(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  // 🔹 Fetch product from backend
  const fetchProduct = useCallback(
    async (barcode) => {
      try {
        const res = await fetch(`http://localhost:5000/items/barcode/${barcode}`);
        let product;
        if (res.ok) {
          const data = await res.json();
          product = {
            barcode: data.barcode,
            name: data.name,
            category: data.category,
            price: parseFloat(data.price),
          };
        } else {
          product = {
            barcode: barcode,
            name: "Unknown Product",
            category: "N/A",
            price: 0,
          };
        }

        console.log("✅ Scanned product:", product);

        // Prevent duplicate entries: increment quantity if already in cart
        const existing = cart.find((item) => item.barcode === product.barcode);
        if (existing) {
          onQuantityChange(product.barcode, existing.quantity + 1);
        } else {
          onAddToCart({ ...product, quantity: 1 });
        }
      } catch (err) {
        console.error("Fetch error:", err.message);
      }
    },
    [cart, onAddToCart, onQuantityChange]
  );

  // 🔹 Camera scanning effect
  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        scannerRef.current = await codeReader.decodeFromVideoDevice(
          null,
          videoRef.current,
          (result) => {
            if (result) fetchProduct(result.getText());
          }
        );
      } catch (err) {
        console.error("📸 Scanner error:", err.message);
        alert("Cannot access camera. Please check permissions.");
        setIsScanning(false);
      }
    };

    if (isScanning) {
      startScanner();
    } else if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current = null;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current = null;
      }
    };
  }, [isScanning, fetchProduct]);

  // 🔹 Manual barcode input
  const handleManualAdd = () => {
    if (!barcodeInput.trim()) return alert("Please enter a barcode!");
    fetchProduct(barcodeInput.trim());
    setBarcodeInput("");
  };

  // 🔹 Quantity adjustment
  const adjustQuantity = (barcode, delta) => {
    const item = cart.find((i) => i.barcode === barcode);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    onQuantityChange(barcode, newQty);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>📷 Barcode Scanner</h2>

      {/* Toggle Camera */}
      <button
        onClick={() => setIsScanning(!isScanning)}
        style={{
          padding: "10px 15px",
          marginBottom: "15px",
          borderRadius: "5px",
          background: isScanning ? "red" : "green",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {isScanning ? "Stop Camera" : "Start Camera"}
      </button>

      {/* Manual Barcode Input */}
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder="Enter barcode manually"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          style={{
            padding: "8px",
            width: "250px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleManualAdd}
          style={{
            background: "blue",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      {/* Camera View */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: "100%",
            maxWidth: "400px",
            border: "3px solid #333",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            display: isScanning ? "block" : "none",
          }}
        />
      </div>

      {/* Cart Items */}
      <div style={{ marginTop: "25px" }}>
        {cart.length === 0 ? (
          <p>No items scanned yet.</p>
        ) : (
          cart.map((item) => (
            <div
              key={item.barcode}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "15px",
                margin: "15px auto",
                width: "90%",
                maxWidth: "400px",
              }}
            >
              <h3>{item.name}</h3>
              <p>₱{item.price.toFixed(2)}</p>
              <p style={{ color: "#888" }}>{item.category}</p>

              {/* Quantity Controls */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => adjustQuantity(item.barcode, -1)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      width: "30px",
                      height: "30px",
                      fontSize: "18px",
                      cursor: "pointer",
                    }}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => adjustQuantity(item.barcode, 1)}
                    style={{
                      background: "green",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      width: "30px",
                      height: "30px",
                      fontSize: "18px",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => onDeleteItem(item.barcode)}
                  style={{
                    background: "gray",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Scanner;
