import React, { useState } from "react";
import "./register.css";
const URI="https://timecapsule-backend-3fch.onrender.com";

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`${URI}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Check for user already exists error
        if (
          data.message &&
          (data.message.toLowerCase().includes("user already exists") ||
            data.message.toLowerCase().includes("email already exists"))
        ) {
          setError("User already created, Please Try Login");
          setTimeout(() => setRedirectToLogin(true), 2000); // Redirect after 2 seconds
        } else {
          setError(data.message || "Registration failed");
        }
      } else {
        setSuccess(true);
        if (onRegister) onRegister(data);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  if (redirectToLogin) {
    // Show login page after redirect
    // You can use a prop or context to trigger login page in your app,
    // or simply reload if using the login/register toggle in the same component.
    window.location.reload(); // Or trigger your login page logic here
    return null;
  }

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="register-title">Register</div>
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <button type="submit">Register</button>
      {success && (
        <div style={{ color: "green", marginTop: "1rem" }}>
          Registration successful! You can now log in.
        </div>
      )}
      {error && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          {error}
        </div>
      )}
    </form>
  );
};

export default Register;