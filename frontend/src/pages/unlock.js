import React, { useEffect, useState } from "react";
import "./unlock.css";
import Cookies from "js-cookie";

const Unlock = () => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCapsules = async () => {
      setLoading(true);
      setError("");
      try {
        const token = Cookies.get("token");
        const res = await fetch("http://localhost:5000/api/capsules/unlocked", {
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

    fetchCapsules();
  }, []);

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
            <strong>Unlocked Date:</strong> {new Date(cap.unlockDate).toLocaleDateString()}
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
        </div>
      ))}
    </div>
  );
};

export default Unlock;