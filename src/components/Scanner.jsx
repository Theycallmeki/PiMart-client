// Scanner.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const Scanner = ({ cart, onAddToCart, onQuantityChange, onDeleteItem }) => {
  const videoRef = useRef(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Fetch product details from backend
  const fetchProduct = useCallback(
    async (barcode) => {
      try {
        const res = await fetch(
          `https://smart-inventory-software.onrender.com/api/items/barcode/${barcode}`
        );
        if (!res.ok) throw new Error("Item not found");
        const data = await res.json();

        const foundProduct = {
          barcode: data.barcode,
          name: data.name,
          category: data.category,
          price: parseFloat(data.price),
        };

        console.log("✅ Scanned product:", foundProduct);
        onAddToCart(foundProduct);
      } catch (err) {
        console.error(err.message);
        const unknownProduct = {
          barcode: barcode,
          name: "Unknown Product",
          category: "N/A",
          price: 0,
        };
        onAddToCart(unknownProduct);
      }
    },
    [onAddToCart]
  );

  // Initialize barcode scanner
  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let controlsInstance;

    const startScanner = async () => {
      try {
        controlsInstance = await codeReader.decodeFromVideoDevice(
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

    if (isScanning) startScanner();

    return () => {
      if (controlsInstance && typeof controlsInstance.stop === "function") {
        controlsInstance.stop();
      }
    };
  }, [isScanning, fetchProduct]);

  // Manually add a product by entering barcode
  const handleManualAdd = () => {
    if (!barcodeInput.trim()) return alert("Please enter a barcode!");
    fetchProduct(barcodeInput.trim());
    setBarcodeInput("");
  };

  // Adjust quantity with +/− buttons
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

      {/* Show Scanned Items */}
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
