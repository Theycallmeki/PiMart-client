import React, { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCartShopping, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import api from "../api/axios";

/* =======================
   PAGE WRAPPER
======================= */
const PageWrapper = ({ children }) => (
  <div className="page-wrapper">
    {children}
    <style>{`
      * { box-sizing: border-box; }
      body { overflow-x: hidden; }

      .page-wrapper {
        max-width: 1200px; margin: 80px auto 40px; padding: 40px;
        background: white; border-radius: 20px;
        box-shadow: 0 12px 30px rgba(0,0,0,.15);
        font-family: 'Poppins', sans-serif;
      }

      .scanner-layout { display: flex; gap: 24px; margin-top: 30px; align-items: flex-start; }
      .scanner-column { flex: 1; min-width: 0; }
      .scanner-actions { display: flex; gap: 10px; margin-bottom: 16px; }

      .scanner-input {
        flex: 1; padding: 10px; width: 100%;
        border-radius: 8px; border: 1px solid #CBD5E1;
      }

      .scanner-video-wrapper { position: relative; }
      .scanner-video {
        width: 100%; aspect-ratio: 4/3; object-fit: cover;
        border-radius: 12px; border: 3px solid #113F67;
      }

      .barcode-overlay {
        position: absolute; inset: 0; display: flex;
        align-items: center; justify-content: center; pointer-events: none;
      }

      .barcode-box {
        width: 70%; height: 45%;
        border: 3px dashed #22C55E; border-radius: 12px;
        background: rgba(0,0,0,.15);
      }

      .success-modal {
        position: fixed; inset: 0; z-index: 999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,.6);
      }

      .success-box {
        background: white; padding: 32px; min-width: 280px;
        border-radius: 16px; text-align: center;
        box-shadow: 0 12px 30px rgba(0,0,0,.25);
      }

      .suggestions {
        background: white; margin-top: 6px;
        border: 1px solid #CBD5E1; border-radius: 8px;
        max-height: 180px; overflow-y: auto;
      }

      .suggestion-item { padding: 10px; cursor: pointer; }
      .suggestion-item:hover { background: #F3F4F6; }

      @media (max-width: 768px) {
        .page-wrapper { margin: 0; padding: 16px; border-radius: 0; box-shadow: none; }
        .scanner-layout { flex-direction: column; }
        .scanner-actions { flex-direction: column; }
        .scanner-actions button { width: 100%; }
      }
    `}</style>
  </div>
);

/* =======================
   SHARED COMPONENTS
======================= */
const Section = ({ children }) => (
  <div style={{
    marginTop: 24, padding: 24, borderRadius: 16,
    background: "#EBEBEB", border: "1px solid #E5E7EB",
    boxShadow: "0 6px 16px rgba(0,0,0,.1)"
  }}>
    {children}
  </div>
);

const PrimaryButton = ({ children, onClick, style }) => (
  <button
    onClick={onClick}
    style={{
      background: "#113F67", color: "#fff", border: "none",
      borderRadius: 8, padding: "12px 18px",
      fontWeight: 600, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      ...style
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
  const [nameInput, setNameInput] = useState("");
  const [items, setItems] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [successItem, setSuccessItem] = useState(null);

  useEffect(() => { api.get("/items").then(res => setItems(res.data)); }, []);

  const fetchProduct = useCallback(async (barcode, { resumeScan = false } = {}) => {
    if (!barcode) return;
    try {
      const { data } = await api.get(`items/barcode/${barcode}`);
      const product = { ...data, price: parseFloat(data.price) };

      const existing = cart.find(i => i.barcode === product.barcode);
      existing
        ? onQuantityChange(product.barcode, existing.quantity + 1)
        : onAddToCart({ ...product, quantity: 1 });

      setSuccessItem(product);
      setIsScanning(false);

      setTimeout(() => {
        setSuccessItem(null);
        if (resumeScan) setIsScanning(true);
      }, 1500);
    } catch (e) { console.error(e); }
  }, [cart, onAddToCart, onQuantityChange]);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    if (!isScanning) return scannerRef.current?.stop();

    reader.decodeFromVideoDevice(null, videoRef.current, result => {
      if (!result) return;
      const code = result.getText();
      if (code !== lastScannedRef.current) {
        lastScannedRef.current = code;
        fetchProduct(code, { resumeScan: true });
      }
    });

    scannerRef.current = reader;
    return () => reader.reset();
  }, [isScanning, fetchProduct]);

  const suggestions = items.filter(i =>
    i.name.toLowerCase().startsWith(nameInput.toLowerCase())
  );

  return (
    <PageWrapper>
      <PrimaryButton onClick={() => navigate("/items")} style={{ marginLeft: "auto" }}>
        <FontAwesomeIcon icon={faCartShopping} /> Go to Cart
      </PrimaryButton>

      <h2 style={{ color: "#113F67", marginTop: 24 }}>
        <FontAwesomeIcon icon={faCamera} /> Barcode Scanner
      </h2>

      <div className="scanner-layout">
        <div className="scanner-column">
          <Section>
            <PrimaryButton
              onClick={() => setIsScanning(s => !s)}
              style={{ background: isScanning ? "#DC2626" : "#16A34A", marginBottom: 16 }}
            >
              {isScanning ? "Stop Camera" : "Start Camera"}
            </PrimaryButton>

            <div className="scanner-actions">
              <input className="scanner-input" value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                placeholder="Enter barcode manually" />
              <PrimaryButton onClick={() => fetchProduct(barcodeInput)}>Add</PrimaryButton>
            </div>

            {isScanning && (
              <div className="scanner-video-wrapper">
                <video ref={videoRef} className="scanner-video" />
                <div className="barcode-overlay"><div className="barcode-box" /></div>
              </div>
            )}

            <input className="scanner-input" style={{ marginTop: 16 }}
              value={nameInput} onChange={e => setNameInput(e.target.value)}
              placeholder="Add item by name" />

            {nameInput && (
              <div className="suggestions">
                {suggestions.map(item => (
                  <div key={item.barcode} className="suggestion-item"
                    onClick={() => { fetchProduct(item.barcode); setNameInput(""); }}>
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div className="scanner-column">
          <Section>
            <h3 style={{ color: "#113F67" }}>
              <FontAwesomeIcon icon={faPaperclip} /> Scanned Items
            </h3>

            {!cart.length ? <p style={{ color: "#6B7280" }}>No items yet...</p> :
              cart.map(item => (
                <div key={item.barcode} style={{ borderBottom: "1px solid #E5E7EB", padding: "12px 0" }}>
                  <strong>{item.name}</strong>
                  <p>₱{item.price.toFixed(2)}</p>
                  <p style={{ color: "#6B7280" }}>{item.category}</p>

                  <PrimaryButton
                    onClick={() => {
                      onDeleteItem(item.barcode);
                      if (lastScannedRef.current === item.barcode) lastScannedRef.current = null;
                    }}
                    style={{ background: "#9d0909" }}
                  >
                    Remove
                  </PrimaryButton>
                </div>
              ))
            }
          </Section>
        </div>
      </div>

      {successItem && (
        <div className="success-modal">
          <div className="success-box">
            <h3>Item Added</h3>
            <strong>{successItem.name}</strong>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Scanner;
