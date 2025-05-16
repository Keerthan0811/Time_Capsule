import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/navbar";
import PageCard from "./components/pagecard";
import Login from "./pages/login";
import Create from "./pages/create";
import Unlock from "./pages/unlock";
import Dates from "./pages/dates";

function App() {
  const [selectedPage, setSelectedPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        pageContent = <Unlock />;
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
    <div className="App">
      <Navbar onMenuSelect={handleMenuSelect} isLoggedIn={isLoggedIn} />
      <PageCard title={pageTitle}>{pageContent}</PageCard>
    </div>
  );
}

export default App;