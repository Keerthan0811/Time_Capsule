import React, { useState } from "react";
import Register from "./register";
import "./login.css";
import Cookies from "js-cookie"; // <-- Add this import

const Login = ({ onLoginSuccess, onLoginBlast }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginFailed, setLoginFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginFailed(false);
    setErrorMsg("");

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginFailed(true);
        setErrorMsg(data.message || "Login failed.");
      } else {
        localStorage.setItem("user", JSON.stringify(data));
        // Set cookie for 7 days
        Cookies.set("token", data.token, { expires: 7 });
        setErrorMsg("");
        if (onLoginBlast && window.loginBtn) {
          const rect = window.loginBtn.getBoundingClientRect();
          onLoginBlast({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });
        }
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
        }, 800); // Wait for blast animation
      }
    } catch (err) {
      setLoginFailed(true);
      setErrorMsg("Network error. Please try again.");
    }
  };

  if (showRegister) {
    return <Register />;
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-title">Login</div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div className="login-buttons">
        <button
          type="submit"
          ref={(btn) => (window.loginBtn = btn)} // Add a ref for the login button
        >
          Login
        </button>
        <button
          type="button"
          className="create-account-btn"
          onClick={() => setShowRegister(true)}
        >
          Register
        </button>
      </div>
      {loginFailed && <div className="login-error">{errorMsg}</div>}
    </form>
  );
};

export default Login;