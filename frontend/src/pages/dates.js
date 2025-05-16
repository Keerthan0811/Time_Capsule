import React, { useEffect, useState } from "react";

const Dates = () => {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCapsules = async () => {
      setLoading(true);
      setError("");
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;
        // Fetch all capsules, not just unlocked
        const res = await fetch("http://localhost:5000/api/capsules/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to fetch capsules.");
        } else {
          const today = new Date();
          const allDates = data.map((cap) => {
            const unlockDateObj = cap.unlockDate && new Date(cap.unlockDate);
            return {
              date: unlockDateObj ? unlockDateObj.toLocaleDateString() : "",
              isFuture: unlockDateObj ? unlockDateObj > today : false,
            };
          });
          setDates(allDates.filter((d) => d.date));
        }
      } catch (err) {
        setError("Network error. Please try again.");
      }
      setLoading(false);
    };

    fetchCapsules();
  }, []);

  if (loading) return <div>Loading unlock dates...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!dates.length) return <div>No unlock dates found.</div>;

  return (
    <div>
      <ol>
        {dates.map((item, idx) => (
          <li
            key={idx}
            style={{
              color: item.isFuture ? "red" : "green",
              fontWeight: "bold",
            }}
          >
            {item.date} {item.isFuture ? "(Locked)" : "(Unlocked)"}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Dates;