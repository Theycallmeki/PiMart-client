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
      }

      .scanner-video-wrapper {
        position: relative;
        width: 100%;
        aspect-ratio: 4 / 3;
        background: black;
        border-radius: 12px;
        overflow: hidden;
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
        border: 2px solid rgba(0,255,0,0.9);
        border-radius: 12px;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.45);
      }

      .scan-line {
        position: absolute;
        left: 0;
        width: 100%;
        height: 2px;
        background: lime;
        animation: scan 2s linear infinite;
      }

      @keyframes scan {
        0% { top: 0; }
        100% { top: 100%; }
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

  /* 🎥 CAMERA + CONTINUOUS SCAN (MOBILE SAFE) */
  useEffect(() => {
    if (!isScanning) return;
    if (typeof window === "undefined") return;

    let stream;
    let cancelled = false;

    const startScanner = async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        readerRef.current = new BrowserMultiFormatReader();

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.muted = true; // REQUIRED FOR iOS
        await video.play();

        readerRef.current.decodeFromVideoElementContinuously(
          video,
          (result) => {
            if (cancelled || !result) return;

            const code = result.getText();
            if (code !== lastScannedRef.current) {
              lastScannedRef.current = code;
              fetchProduct(code);
              setIsScanning(false); // stop after scan
            }
          }
        );
      } catch (err) {
        console.error(err.name, err.message);
        alert("Camera permission denied or unavailable");
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      cancelled = true;

      try {
        if (readerRef.current?.reset) {
          readerRef.current.reset();
        }
      } catch {}

      readerRef.current = null;

      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isScanning, fetchProduct]);

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
              onClick={() => setIsScanning((s) => !s)}
              style={{
                background: isScanning ? "#DC2626" : "#16A34A",
                marginBottom: 16,
              }}
            >
              {isScanning ? "Stop Camera" : "Start Camera"}
            </PrimaryButton>

            <input
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Enter barcode manually"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                marginBottom: 10,
              }}
            />

            <PrimaryButton onClick={() => fetchProduct(barcodeInput)}>
              Add Manually
            </PrimaryButton>

            {isScanning && (
              <>
                <div className="scanner-video-wrapper">
                  <video
                    ref={videoRef}
                    className="scanner-video"
                    playsInline
                    muted
                  />
                  <div className="scan-box">
                    <div className="scan-line" />
                  </div>
                </div>

                <p style={{ textAlign: "center", marginTop: 8 }}>
                  Align barcode inside the box
                </p>
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
