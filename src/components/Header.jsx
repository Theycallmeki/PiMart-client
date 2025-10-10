import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "🏠 Home", path: "/" },
    { label: "📷 Scanner", path: "/scanner" },
    { label: "⭐ Best Sellers", path: "/best" },
  ];

  return (
    <header className="header">
      {/* Decorative overlay */}
      <div className="overlay" />

      <div className="header-content">
        <h1 className="logo">🛒 PiMart</h1>
        <p className="subtitle"></p>

        {/* Hamburger button for mobile */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Navigation */}
        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          {navLinks.map((link, index) => (
            <Link key={index} to={link.path} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Inline CSS */}
      <style>{`
        .header {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.15);
          color: black; /* changed from white */
          padding: 8px 16px;
          border-radius: 16px;
          margin: 12px auto;
          max-width: 900px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(8px);
          font-family: 'Poppins', 'Roboto', sans-serif;
          text-align: center;
          z-index: 1;
        }

        .overlay {
          position: absolute;
          top: -40%;
          right: -10%;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .logo {
          font-size: 2rem;
          margin: 0 0 4px 0;
          font-weight: 900;
          letter-spacing: -1px;
          background: none; /* remove gradient */
          color: black; /* changed to black */
          -webkit-background-clip: unset;
          -webkit-text-fill-color: unset;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        .subtitle {
          font-size: 0.85rem;
          margin: 0 0 8px 0;
          opacity: 0.9;
          font-weight: 400;
          letter-spacing: 0.5px;
          color: black; /* changed to black */
        }

        .nav-links {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          flex-direction: row;
          transition: max-height 0.3s ease, opacity 0.3s ease;
        }

        .nav-link {
          color: black; /* changed to black */
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 6px 12px;
          border-radius: 12px;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .hamburger-btn {
          display: none;
          background: transparent;
          border: none;
          color: black; /* changed to black */
          font-size: 1.8rem;
          cursor: pointer;
          margin-bottom: 8px;
        }

        @media (max-width: 600px) {
          .hamburger-btn {
            display: block;
          }
          .nav-links {
            flex-direction: column;
            gap: 5px;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
          }
          .nav-links.open {
            max-height: 500px;
            opacity: 1;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
