import React, { useRef, useState } from "react";
import "./App.css";
import Navbar from "./components/navbar";
import PageCard from "./components/pagecard";
import Login from "./pages/login";
import Create from "./pages/create";
import Unlock from "./pages/unlock";
import Dates from "./pages/dates";
import ParticlesBackground from "./components/ParticlesBackground";
const URI="https://timecapsule-backend-3fch.onrender.com";

function App() {
  const [selectedPage, setSelectedPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState("light");
  const [showModal, setShowModal] = useState(false);
  const [modalDeleteId, setModalDeleteId] = useState(null);
  const [refreshUnlock, setRefreshUnlock] = useState(false);
  const particlesRef = useRef();

  // Handler for navbar menu selection
  const handleMenuSelect = (page) => {
    if (page === "logout") {
      setIsLoggedIn(false);
      setSelectedPage("login");
      localStorage.removeItem("user");
    } else {
      setSelectedPage(page);
    }
  };

  // Toggle theme
  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // Handler to open modal from Unlock page
  const handleRequestDelete = (id) => {
    setShowModal(true);
    setModalDeleteId(id);
  };

  // Handler to confirm delete
  const handleConfirmDelete = async () => {
    setShowModal(false);
    try {
      const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : "";
      await fetch(`${URI}/api/capsules/${modalDeleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Optionally handle error here
      setRefreshUnlock((prev) => !prev); // trigger refresh in Unlock
    } catch (err) {
      // Optionally handle error here
    }
    setModalDeleteId(null);
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setModalDeleteId(null);
  };

  let pageContent;
  let pageTitle = "";

  if (!isLoggedIn) {
    // Always show login page in PageCard until logged in
    pageTitle = "Login/Register";
    pageContent = (
      <Login
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setSelectedPage("create"); // Redirect to Create after login
        }}
      />
    );
  } else {
    // After login, allow navigation
    switch (selectedPage) {
      case "create":
        pageTitle = "Create Capsule";
        pageContent = <Create username="YourUsername" />;
        break;
      case "unlock":
        pageTitle = "Unlocked Capsule";
        pageContent = (
          <Unlock
            onRequestDelete={handleRequestDelete}
            refresh={refreshUnlock}
          />
        );
        break;
      case "unlockDates":
        pageTitle = "Capsule Unlock Dates";
        pageContent = <Dates />;
        break;
      case "history":
        pageTitle = "History";
        pageContent = <div>History page coming soon...</div>;
        break;
      default:
        pageTitle = "Create Capsule";
        pageContent = <Create username="YourUsername" />;
    }
  }

  return (
    <div className={`App ${theme}`}>
      <ParticlesBackground ref={particlesRef} theme={theme} />
      <Navbar
        onMenuSelect={handleMenuSelect}
        isLoggedIn={isLoggedIn}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <PageCard title={pageTitle}>
        {React.cloneElement(pageContent, {
          onLoginBlast: (pos) => particlesRef.current?.blast?.(pos)
        })}
      </PageCard>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">Are You Sure Want To Delete The Capsule?</div>
            <div className="modal-actions">
              <button className="modal-btn delete" onClick={handleConfirmDelete}>Delete</button>
              <button className="modal-btn cancel" onClick={handleCancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;