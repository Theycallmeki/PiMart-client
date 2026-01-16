import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faCartShopping,
  faPaperclip,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
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
      }

      .scanner-column {
        flex: 1;
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
      }

      .scanner-video-wrapper {
        position: relative;
        width: 100%;
        aspect-ratio: 4 / 3;
        border-radius: 12px;
        overflow: hidden;
        background: black;
        border: 3px solid #113F67;
      }

      .scanner-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* Scan overlay */
      .scan-box {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 70%;
        height: 40%;
        transform: translate(-50%, -50%);
        border: 2px solid lime;
        border-radius: 12px;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.45);
      }

      .scan-line {
        position: absolute;
        width: 100%;
        height: 2px;
        background: lime;
        animation: scan 2s linear infinite;
      }

      @keyframes scan {
        from { top: 0; }
        to { top: 100%; }
      }

      /* Toast */
      .toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #16A34A;
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        z-index: 9999;
      }

      @media (max-width: 768px) {
        .page-wrapper {
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
      }
    `}</style>
  </div>
);

/* =======================
   SECTION
======================= */
const Section = ({ children }) => (
  <div
    style={{
      marginTop: 24,
      padding: 24,
      borderRadius: 16,
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
      borderRadius: 8,
      padding: "12px 18px",
      fontWeight: 600,
      cursor: "pointer",
      width: "100%",
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
  const readerRef = useRef(null);
  const streamRef = useRef(null);
  const lastScannedRef = useRef(null);
  const navigate = useNavigate();

  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [toast, setToast] = useState("");

  /* 🔔 NOTIFICATION */
  const notifyScan = (name) => {
    setToast(`${name} added`);
    if (navigator.vibrate) navigator.vibrate(150);
    setTimeout(() => setToast(""), 2000);
  };

  /* 🔍 FETCH PRODUCT */
  const fetchProduct = useCallback(
    async (barcode) => {
      try {
        const res = await api.get(`items/barcode/${barcode}`);
        const data = res.data;

        const existing = cart.find((i) => i.barcode === data.barcode);
        if (existing) {
          onQuantityChange(data.barcode, existing.quantity + 1);
        } else {
          onAddToCart({
            barcode: data.barcode,
            name: data.name,
            category: data.category,
            price: parseFloat(data.price),
            quantity: 1,
          });
        }

        notifyScan(data.name);
      } catch {
        alert("Product not found");
      }
    },
    [cart, onAddToCart, onQuantityChange]
  );

  /* 🎥 START CAMERA — USER GESTURE SAFE */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      setIsScanning(true);

      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      readerRef.current = new BrowserMultiFormatReader();

      readerRef.current.decodeFromVideoElementContinuously(video, (result) => {
        if (!result) return;

        const code = result.getText();
        if (code !== lastScannedRef.current) {
          lastScannedRef.current = code;
          fetchProduct(code);
          stopCamera();
        }
      });
    } catch (err) {
      alert("Camera permission denied");
    }
  };

  /* 🛑 STOP CAMERA */
  const stopCamera = () => {
    setIsScanning(false);
    try {
      readerRef.current?.reset?.();
    } catch {}
    readerRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  return (
    <PageWrapper>
      {toast && (
        <div className="toast">
          <FontAwesomeIcon icon={faCheckCircle} /> {toast}
        </div>
      )}

      <PrimaryButton
        onClick={() => navigate("/items")}
        style={{ maxWidth: 220, marginLeft: "auto" }}
      >
        <FontAwesomeIcon icon={faCartShopping} /> Go to Cart
      </PrimaryButton>

      <h2 style={{ color: "#113F67", marginTop: 24 }}>
        <FontAwesomeIcon icon={faCamera} /> Barcode Scanner
      </h2>

      <div className="scanner-layout">
        <div className="scanner-column">
          <Section>
            <PrimaryButton
              onClick={isScanning ? stopCamera : startCamera}
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

            {isScanning && (
              <div className="scanner-video-wrapper">
                <video ref={videoRef} className="scanner-video" />
                <div className="scan-box">
                  <div className="scan-line" />
                </div>
              </div>
            )}
          </Section>
        </div>

        {cart.length > 0 && (
          <div className="scanner-column">
            <Section>
              <h3 style={{ color: "#113F67" }}>
                <FontAwesomeIcon icon={faPaperclip} /> Scanned Items
              </h3>

              {cart.map((item) => (
                <div key={item.barcode} style={{ padding: "12px 0" }}>
                  <strong>{item.name}</strong>
                  <p>₱{item.price.toFixed(2)}</p>
                  <p>{item.category}</p>
                  <PrimaryButton
                    onClick={() => onDeleteItem(item.barcode)}
                    style={{ background: "#9d0909" }}
                  >
                    Remove
                  </PrimaryButton>
                </div>
              ))}
            </Section>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Scanner;
