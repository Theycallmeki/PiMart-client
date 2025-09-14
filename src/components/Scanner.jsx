// Scanner.jsx
import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const Scanner = ({ onAddToCart }) => {
  const videoRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [controls, setControls] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    if (isScanning) {
      const c = codeReader.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result) => {
          if (result) fetchProduct(result.getText());
        }
      );
      setControls(c);
    } else if (controls && typeof controls.stop === "function") {
      controls.stop();
    }

    return () => controls && typeof controls.stop === "function" && controls.stop();
  }, [isScanning]);

  // 🔹 Fetch product from backend instead of mock database
  const fetchProduct = async (barcode) => {
    try {
      const res = await fetch(`http://localhost:3005/api/items/barcode/${barcode}`);
      if (!res.ok) {
        throw new Error("Item not found");
      }
      const data = await res.json();

      const foundProduct = {
        barcode: data.barcode,  // use barcode
        name: data.name,
        category: data.category,
        price: parseFloat(data.price),
      };

      console.log("Scanned product:", foundProduct);
      setProduct(foundProduct);
      onAddToCart(foundProduct);
    } catch (err) {
      console.error(err.message);
      const unknownProduct = {
        barcode: barcode,      // use barcode
        name: "Unknown Product",
        category: "N/A",
        price: 0,
      };
      setProduct(unknownProduct);
      onAddToCart(unknownProduct);
    }
  };

  // 🔹 Handle uploaded barcode image
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = async () => {
        const codeReader = new BrowserMultiFormatReader();
        try {
          const result = await codeReader.decodeFromImageElement(img);
          console.log("Image scanned barcode:", result.getText());
          fetchProduct(result.getText());
        } catch (err) {
          console.error("No barcode found in image", err);
          alert("No barcode detected in this image.");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Scan Product</h2>

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

      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ margin: "10px" }} />

      <video
        ref={videoRef}
        style={{
          width: "100%",
          maxWidth: "400px",
          border: "1px solid #ccc",
          display: isScanning ? "block" : "none",
        }}
      />

      {product && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "15px",
            marginTop: "15px",
            maxWidth: "300px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <h3>{product.name}</h3>
          <p>Category: {product.category}</p>
          <p><b>₱{product.price}</b></p>
          <button onClick={() => onAddToCart(product)}>Add to Cart</button>
        </div>
      )}
    </div>
  );
};

export default Scanner;