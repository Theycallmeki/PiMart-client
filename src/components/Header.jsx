import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header
      style={{
        padding: "10px", // reduced from 15px
        backgroundColor: "#007bff",
        color: "white",
        textAlign: "center",
        borderRadius: "8px",
        marginBottom: "15px" // slightly smaller margin
      }}
    >
      <h1 style={{ fontSize: "1.5rem", margin: "5px 0" }}>PiMart</h1>
      <p style={{ fontSize: "0.9rem", margin: "0" }}>Smart Inventory & Self-Checkout</p>

      {/* Navbar */}
      <nav style={{ marginTop: "8px" }}>
        <Link
          to="/"
          style={{
            color: "white",
            margin: "0 12px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "0.9rem"
          }}
        >
          Home
        </Link>
        <Link
          to="/scanner"
          style={{
            color: "white",
            margin: "0 12px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "0.9rem"
          }}
        >
          Scanner
        </Link>
      </nav>
    </header>
  );
};

export default Header;