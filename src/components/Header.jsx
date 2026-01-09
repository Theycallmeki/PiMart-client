import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/auth/useAuth";
import { FaShoppingCart } from "react-icons/fa";


const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const { logout } = useAuth();

  const navLinks = [
    { label: "Cart", path: "/items" },
    { label: "Scanner", path: "/scanner" },
    { label: "Best Sellers", path: "/best" },
  ];

return (
  <header className="header">
    <div className="header-content">
      
      <button
        className="hamburger-btn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <h1 className="logo"> <FaShoppingCart className="logo-icon" />PiMart</h1>


      <button
        onClick={logout}
        className="logout-btn"
      >
        Logout
      </button>

      {/* Hamburger Menu */}
      <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>

    {/* Inline CSS */}
    <style>{`
      .header {
        width: 100%;
        background: #ffffff;
        border-bottom: 1px solid rgba(17, 63, 103, 0.15);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        font-family: 'Poppins', sans-serif;
      }

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
      }

      /* Hamburger LEFT */
      .hamburger-btn {
        background: transparent;
        border: none;
        font-size: 1.8rem;
        cursor: pointer;
        color: #113F67;
      }

      /* Logo CENTER */
      .logo {
  font-size: 1.8rem;
  font-weight: 800;
  color: #113F67;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 1.6rem;
}


      /* Logout RIGHT */
      .logout-btn {
        background: transparent;
        border: none;
        color: #113F67;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
      }

      .logout-btn:hover {
        color: #0D3558;
      }

      /* Menu */
      .nav-links {
        position: absolute;
        top: 60px;
        left: 0;
        width: 100%;
        background: #ffffff;
        border-top: 1px solid #E5E7EB;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 16px 0;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
      }

      .nav-links.open {
        max-height: 300px;
        opacity: 1;
      }

      .nav-link {
        color: #113F67;
        text-decoration: none;
        font-weight: 600;
        font-size: 1rem;
        padding: 8px 16px;
        border-radius: 10px;
        width: 100%;
        text-align: center;
      }

      .nav-link:hover {
        background: rgba(17, 63, 103, 0.1);
      }
    `}</style>
  </header>
);

};

export default Header;
