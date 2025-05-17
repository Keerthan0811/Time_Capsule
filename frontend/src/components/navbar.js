import React, { useState } from "react";
import "./navbar.css";

const Navbar = ({ onMenuSelect, isLoggedIn, theme, onToggleTheme }) => {
  const [open, setOpen] = useState(false);

  const handleHamburgerClick = () => {
    if (isLoggedIn) setOpen((prev) => !prev);
  };

  const handleMenuClick = (page) => {
    setOpen(false);
    if (onMenuSelect) onMenuSelect(page);
  };

  const handleLogout = () => {
    setOpen(false);
    if (onMenuSelect) onMenuSelect("logout");
  };

  // New: handle click on title
  const handleTitleClick = () => {
    if (isLoggedIn && onMenuSelect) onMenuSelect("create");
  };

  return (
    <nav className="navbar">
      <button
        className="navbar-title"
        onClick={handleTitleClick}
        disabled={!isLoggedIn}
        style={{
          cursor: isLoggedIn ? "pointer" : "default",
          fontSize: "2rem",
          fontWeight: "bold",
          letterSpacing: "2px",
          padding: 0,
          color: "inherit",
        }}
        aria-label="Go to Create Capsule"
      >
        {isLoggedIn ? "TIME CAPSULE" : "Welcome to Time Capsule"}
      </button>
      <div className="navbar-actions">
        <div
          className={`navbar-hamburger${open ? " open" : ""}`}
          onClick={handleHamburgerClick}
          aria-label="Toggle menu"
          tabIndex={isLoggedIn ? 0 : -1}
          role="button"
          style={{
            pointerEvents: isLoggedIn ? "auto" : "none",
            opacity: isLoggedIn ? 1 : 0.5,
          }}
        >
          <span />
          <span />
          <span />
        </div>
        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          style={{
            marginLeft: "1rem",
            background: "none",
            border: "none",
            color: "inherit",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
      {isLoggedIn && (
        <div className={`navbar-menu${open ? " show" : ""}`}>
          
          <button className="navbar-link" onClick={() => handleMenuClick("create")}>
            Create
          </button>
          <button className="navbar-link" onClick={() => handleMenuClick("unlock")}>
            Unlock
          </button>
          <button className="navbar-link" onClick={() => handleMenuClick("unlockDates")}>
            Dates
          </button>
          <button className="navbar-link" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;