import React from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/login"); // ✅ always go to login
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Poppins', sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#FFFFFF",
          borderRadius: "20px",
          padding: "48px 32px",
          textAlign: "center",
          boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
        }}
      >
        <FaShoppingCart
          size={42}
          color="#113F67"
          style={{ marginBottom: "16px" }}
        />
        <h2
          style={{
            color: "#113F67",
            fontSize: "clamp(1.6rem, 4vw, 2rem)",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          Welcome to PiMart
        </h2>
        <p
          style={{
            color: "#475569",
            fontSize: "clamp(0.95rem, 2.5vw, 1.05rem)",
            marginBottom: "32px",
            lineHeight: 1.6,
          }}
        >
          A smart inventory and self-checkout system designed for faster,
          simpler, and more efficient shopping.
        </p>
        <button
          onClick={handleStart}
          style={{
            padding: "14px 28px",
            fontSize: "1rem",
            fontWeight: 600,
            backgroundColor: "#113F67",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            width: "100%",
            transition: "all 0.25s ease",
          }}
          onMouseOver={(e) =>
            (e.target.style.backgroundColor = "#0D3558")
          }
          onMouseOut={(e) =>
            (e.target.style.backgroundColor = "#113F67")
          }
        >
          Start Shopping
        </button>
      </div>
    </div>
  );
};

export default Home;
