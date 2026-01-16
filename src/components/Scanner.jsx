import React, { useEffect, useRef, useState, useCallback } from "react";
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

      .scanner-video {
        width: 100%;
        border-radius: 12px;
        border: 3px solid #113F67;
        aspect-ratio: 4 / 3;
        object-fit: cover;
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
  const canvasRef = useRef(null);
  const readerRef = useRef(null);
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
      } catch {
        alert("Product not found");
      }
    },
    [cart, onAddToCart, onQuantityChange]
  );

  /* 🎥 START / STOP CAMERA (SAFE FOR VERCEL) */
  useEffect(() => {
    if (!isScanning) return;
    if (typeof window === "undefined") return;

    let stream;

    const startCamera = async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        readerRef.current = new BrowserMultiFormatReader();

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      } catch (err) {
        console.error(err);
        alert("Camera access denied");
        setIsScanning(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isScanning]);

  /* 📸 CAPTURE & SCAN */
  const captureAndScan = async () => {
    if (!videoRef.current || !readerRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const result = await readerRef.current.decodeFromCanvas(canvas);
      const code = result.getText();

      if (code && code !== lastScannedRef.current) {
        lastScannedRef.current = code;
        fetchProduct(code);
      }
    } catch {
      alert("No barcode detected. Try again.");
    }
  };

  return (
    <PageWrapper>
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

            {isScanning && (
              <>
                <video
                  ref={videoRef}
                  className="scanner-video"
                  playsInline
                  muted
                />

                <PrimaryButton
                  onClick={captureAndScan}
                  style={{ marginTop: 12 }}
                >
                  📸 Capture & Scan
                </PrimaryButton>

                <canvas ref={canvasRef} style={{ display: "none" }} />
              </>
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
