import React, { useState } from "react";
import "./navbar.css";

const Navbar = ({ onMenuSelect, isLoggedIn }) => {
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

  return (
    <nav className="navbar">
      <div className="navbar-title">
        {isLoggedIn ? "TIME CAPSULE" : "Welcome to Time Capsule"}
      </div>
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
      {isLoggedIn && (
        <div className={`navbar-menu${open ? " show" : ""}`}>
          <button className="navbar-link" onClick={handleLogout}>
            Logout
          </button>
          <button className="navbar-link" onClick={() => handleMenuClick("create")}>
            Create
          </button>
          <button className="navbar-link" onClick={() => handleMenuClick("unlock")}>
            Unlock
          </button>
          <button className="navbar-link" onClick={() => handleMenuClick("unlockDates")}>
            UnlockDates
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;