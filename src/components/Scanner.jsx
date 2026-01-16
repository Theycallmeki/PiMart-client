import React, { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faCartShopping,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import api from "../api/axios";

/* =======================
   PAGE WRAPPER
======================= */
const PageWrapper = ({ children }) => (
  <div className="page-wrapper">
    {children}
    <style>{`
      * {
        box-sizing: border-box;
      }

      body {
        overflow-x: hidden;
      }

      .page-wrapper {
        max-width: 1200px;
        margin: 80px auto 40px;
        background: white;
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        font-family: 'Poppins', sans-serif;
      }

      .scanner-layout {
        display: flex;
        gap: 24px;
        margin-top: 30px;
        align-items: flex-start;
      }

      .scanner-column {
        flex: 1;
        min-width: 0;
        width: 100%;
      }

      .scanner-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 16px;
      }

      .scanner-input {
        flex: 1;
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #CBD5E1;
        width: 100%;
      }

      .scanner-video {
        width: 100%;
        border-radius: 12px;
        border: 3px solid #113F67;
        aspect-ratio: 4 / 3;
        object-fit: cover;
      }

      /* ======================
         MOBILE
      ====================== */
      @media (max-width: 768px) {
        .page-wrapper {
          max-width: 100%;
          margin: 0;
          padding: 16px;
          border-radius: 0;
          box-shadow: none;
        }

        .scanner-layout {
          flex-direction: column;
        }

        .scanner-actions {
          flex-direction: column;
        }

        .scanner-actions button {
          width: 100%;
        }
      }
    `}</style>
  </div>
);

/* =======================
   SECTION CARD
======================= */
const Section = ({ children }) => (
  <div
    style={{
      marginTop: "24px",
      padding: "24px",
      borderRadius: "16px",
      background: "#EBEBEB",
      border: "1px solid #E5E7EB",
      boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
    }}
  >
    {children}
  </div>
);

/* =======================
   BUTTON
======================= */
const PrimaryButton = ({ children, onClick, style }) => (
  <button
    onClick={onClick}
    style={{
      background: "#113F67",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "12px 18px",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      width: "auto",
      ...style,
    }}
  >
    {children}
  </button>
);

/* =======================
   MAIN COMPONENT
======================= */
const Scanner = ({ cart, onAddToCart, onQuantityChange, onDeleteItem }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const lastScannedRef = useRef(null);
  const navigate = useNavigate();

  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  /* 🔍 FETCH PRODUCT */
  const fetchProduct = useCallback(
    async (barcode) => {
      if (!barcode) return;

      try {
        const res = await api.get(`items/barcode/${barcode}`);
        const data = res.data;

        const product = {
          barcode: data.barcode,
          name: data.name,
          category: data.category,
          price: parseFloat(data.price),
        };

        const existing = cart.find((i) => i.barcode === product.barcode);
        if (existing) {
          onQuantityChange(product.barcode, existing.quantity + 1);
        } else {
          onAddToCart({ ...product, quantity: 1 });
        }
      } catch (err) {
        console.error("Fetch product failed", err);
      }
    },
    [cart, onAddToCart, onQuantityChange]
  );

  /* 🎥 CAMERA */
  useEffect(() => {
    const reader = new BrowserMultiFormatReader();

    const start = async () => {
      try {
        scannerRef.current = await reader.decodeFromVideoDevice(
          null,
          videoRef.current,
          (result) => {
            if (!result) return;
            const code = result.getText();
            if (code !== lastScannedRef.current) {
              lastScannedRef.current = code;
              fetchProduct(code);
            }
          }
        );
      } catch {
        alert("Camera access denied");
        setIsScanning(false);
      }
    };

    if (isScanning) start();
    else if (scannerRef.current) {
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

  return (
    <PageWrapper>
      <PrimaryButton
        onClick={() => navigate("/items")}
        style={{ maxWidth: 220, marginLeft: "auto" }}
      >
        <FontAwesomeIcon icon={faCartShopping} />
        Go to Cart
      </PrimaryButton>

      <h2 style={{ color: "#113F67", marginTop: 24 }}>
        <FontAwesomeIcon icon={faCamera} /> Barcode Scanner
      </h2>

      <div className="scanner-layout">
        <div className="scanner-column">
          <Section>
            <PrimaryButton
              onClick={() => setIsScanning(!isScanning)}
              style={{
                background: isScanning ? "#DC2626" : "#16A34A",
                marginBottom: 16,
              }}
            >
              {isScanning ? "Stop Camera" : "Start Camera"}
            </PrimaryButton>

            <div className="scanner-actions">
              <input
                className="scanner-input"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Enter barcode manually"
              />
              <PrimaryButton onClick={() => fetchProduct(barcodeInput)}>
                Add
              </PrimaryButton>
            </div>

            {isScanning && <video ref={videoRef} className="scanner-video" />}
          </Section>
        </div>

        <div className="scanner-column">
          <Section>
            <h3 style={{ color: "#113F67" }}>
              <FontAwesomeIcon icon={faPaperclip} /> Scanned Items
            </h3>

            {cart.length === 0 ? (
              <p style={{ color: "#6B7280", marginTop: 12 }}>
                No items yet...
              </p>
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
                    style={{ background: "#9d0909" }}
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