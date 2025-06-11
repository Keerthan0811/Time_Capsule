import React, { useEffect, useState } from "react";
import "./unlock.css";
import Cookies from "js-cookie";
const URI=process.env.REACT_APP_BACKEND_URI;

const Unlock = ({ onRequestDelete, refresh }) => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCapsules = async () => {
    setLoading(true);
    setError("");
    try {
      const token = Cookies.get("token");
      const res = await fetch(`${URI}/api/capsules/unlocked`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to fetch capsules.");
      } else {
        setCapsules(data);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCapsules();
    // eslint-disable-next-line
  }, [refresh]);

  if (loading) return <div>Loading unlocked capsules...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!capsules.length) return <div>No unlocked capsules found.</div>;

  return (
    <div className="unlock-capsule">
      {capsules.map((cap, idx) => (
        <div key={cap._id || idx} style={{ marginBottom: "2rem", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
          <div>
            <strong>Message:</strong>
            <p>{cap.message}</p>
          </div>
          <div>
            <strong>Locked Date:</strong> {new Date(cap.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Unlocked Date:</strong> {new Date(cap.unlockDate).toLocaleString()}
          </div>
          {cap.image && (
            <div>
              <strong>Image:</strong>
              <div>
                <img
                  src={cap.image}
                  alt="Capsule"
                  style={{ maxWidth: "100%", marginTop: "0.5rem", borderRadius: "8px" }}
                />
              </div>
            </div>
          )}
          <button
            style={{
              marginTop: "1rem",
              background: "#d7263d",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "0.5rem 1.2rem",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 2px 8px #d7263d44",
              transition: "background 0.2s, color 0.2s"
            }}
            onClick={() => onRequestDelete(cap._id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default Unlock;