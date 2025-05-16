import React, { useState } from "react";
import "./create.css";
import Cookies from "js-cookie"; // <-- Add this

const Create = ({ username = "Username" }) => {
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [image, setImage] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    const formData = new FormData();
    formData.append("message", message);
    formData.append("unlockDate", unlockDate);
    formData.append("lockedDate", today.toISOString());
    if (image) formData.append("image", image);

    // Get token from cookie
    const token = Cookies.get("token"); // <-- Use cookie

    try {
      const res = await fetch("http://localhost:5000/api/capsules", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create capsule.");
      } else {
        setSuccess(true);
        setMessage("");
        setUnlockDate("");
        setImage(null);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="create-username">
        <strong>{username}</strong>
      </div>
      <div>
        <label>Text Message:</label>
        <textarea
          value={message}
          required
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Write your message here..."
        />
      </div>
      <div>
        <label>Unlock Date:</label>
        <input
          type="date"
          value={unlockDate}
          required
          min={minDateStr}
          onChange={(e) => setUnlockDate(e.target.value)}
        />
      </div>
      <div>
        <label>Image (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      <button type="submit">Create Capsule</button>
      {success && (
        <div style={{ color: "green", marginTop: "1rem" }}>
          Capsule created successfully!
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

export default Create;