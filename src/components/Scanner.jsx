import React, { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";





const PageWrapper = ({ children }) => (
  <div
    style={{
      width: "calc(100% - 80px)",
      margin: "80px auto 40px",
      background: "white",
      borderRadius: "20px",
      padding: "40px",
      boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
      fontFamily: "'Poppins', sans-serif",
      marginTop: "30px",
    }}
  >
    {children}

    {/* ✅ RESPONSIVE STYLES */}
    <style>{`
      @media (max-width: 768px) {
        .scanner-layout {
          flex-direction: column;
        }

        .scanner-column {
          width: 100%;
        }

        .scanner-input {
          width: 100% !important;
        }

        .scanner-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .scanner-video {
          max-height: 280px;
          object-fit: cover;
        }

        .cart-button {
          width: 100%;
          justify-content: center;
        }
      }
    `}</style>
  </div>
);



const Section = ({ children }) => (
  <div
    style={{
      marginTop: "24px",
      padding: "24px",
      borderRadius: "16px",
      background: "#EBEBEB",
      border: "1px solid #E5E7EB",
      boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
      marginBottom: "50px"
    }}
  >
    {children}
  </div>
);


const PrimaryButton = ({ children, onClick, style }) => (
  <button
    onClick={onClick}
    style={{
      background: "#113F67",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "10px 18px",
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "'Poppins', sans-serif",
      ...style,
    }}
  >
    {children}
  </button>
);


const Scanner = ({ cart, onAddToCart, onQuantityChange, onDeleteItem }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const navigate = useNavigate();


  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);

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
            barcode,
            name: "Unknown Product",
            category: "N/A",
            price: 0,
          };
        }

        const existing = cart.find((i) => i.barcode === product.barcode);
        if (existing) {
          onQuantityChange(product.barcode, existing.quantity + 1);
        } else {
          onAddToCart({ ...product, quantity: 1 });
        }
      } catch (err) {
        console.error(err);
      }
    },
    [cart, onAddToCart, onQuantityChange]
  );



useEffect(() => {
  const codeReader = new BrowserMultiFormatReader();

  const startScanner = async () => {
    try {
      scannerRef.current = await codeReader.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result) => {
          if (result) {
            fetchProduct(result.getText());
          }
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
    scannerRef.current.stop();   // ✅ FIX
    scannerRef.current = null;
  }

  return () => {
    if (scannerRef.current) {
      scannerRef.current.stop(); // ✅ FIX
      scannerRef.current = null;
    }
  };
}, [isScanning, fetchProduct]);


  return (
    <PageWrapper>
      <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px",
  }}
>
  <PrimaryButton
  onClick={() => navigate("/items")}
  style={{
    background: "#113F67",
    fontSize: "14px",
    padding: "8px 14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}
>
  <FontAwesomeIcon icon={faCartShopping} />
  Go to Cart
</PrimaryButton>

</div>

      <h2
  style={{
    color: "#113F67",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  }}
>
  <FontAwesomeIcon icon={faCamera} />
  Barcode Scanner
</h2>


  {/* MAIN TWO-COLUMN LAYOUT */}
<div
  style={{
    display: "flex",
    gap: "24px",
    marginTop: "30px",
    alignItems: "flex-start",
  }}
>
  {/* LEFT COLUMN – SCANNER */}
  <div style={{ flex: 1 }}>
    <Section>
      <PrimaryButton
        onClick={() => setIsScanning(!isScanning)}
        style={{
          background: isScanning ? "#DC2626" : "#16A34A",
          marginBottom: "16px",
        }}
      >
        {isScanning ? "Stop Camera" : "Start Camera"}
      </PrimaryButton>

      <div style={{ marginBottom: "16px" }}>
        <input
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          placeholder="Enter barcode manually"
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #CBD5E1",
            width: "70%",
            marginRight: "10px",
          }}
        />
        <PrimaryButton onClick={() => fetchProduct(barcodeInput)}>
          Add
        </PrimaryButton>
      </div>

      {isScanning && (
        <video
          ref={videoRef}
          style={{
            width: "100%",
            borderRadius: "12px",
            border: "3px solid #113F67",
          }}
        />
      )}
    </Section>
  </div>

  <div style={{ flex: 1 }}>
    <Section>
      <h3
  style={{
    color: "#113F67",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  }}
>
  <FontAwesomeIcon icon={faPaperclip} />
  Scanned Items
</h3>


      {cart.length === 0 ? (
        <p>No items scanned yet.</p>
      ) : (
        cart.map((item) => (
          <div
            key={item.barcode}
            style={{
              borderBottom: "1px solid #E5E7EB",
              padding: "12px 0",
            }}
          >
            <strong>{item.name}</strong>
            <p>₱{item.price.toFixed(2)}</p>
            <p style={{ color: "#6B7280" }}>{item.category}</p>

            <PrimaryButton
              onClick={() => onDeleteItem(item.barcode)}
              style={{
                background: "#9d0909ff",
                marginTop: "8px",
              }}
            >
              Remove
            </PrimaryButton>
          </div>
        ))
      )}
    </Section>
  </div>
</div>

    </PageWrapper>
  );
};

export default Scanner;
