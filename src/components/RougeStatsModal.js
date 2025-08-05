// src/components/RougeStatsModal.js
import React, { useEffect, useState } from "react";
import "./TopContributorsModal.css"; // reuse your existing modal style
import axios from "axios";

export default function RougeStatsModal({ threadId, onClose }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Sending ROUGE eval for threadId:", threadId);
        const res = await axios.post("http://localhost:5000/admin/rouge-eval", {
          threadId,
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch ROUGE stats:", err);
        setError("Failed to load ROUGE analytics.");
      }
    };
    fetchStats();
  }, [threadId]);

  return (
    <div className="top-modal-overlay">
      <div className="top-modal-content">
        <h3>Summary Evaluation</h3>
        {error && <p>{error}</p>}
        {!stats ? (
          <p>Loading...</p>
        ) : (
          <ul className="top-list">
            <li>
              <strong>ROUGE-1:</strong> {stats.rouge1?.toFixed(3)}
            </li>
            <li>
              <strong>ROUGE-2:</strong> {stats.rouge2?.toFixed(3)}
            </li>
            <li>
              <strong>ROUGE-L:</strong> {stats.rougeL?.toFixed(3)}
            </li>
          </ul>
        )}
        <button onClick={onClose} className="top-close-button">
          Close
        </button>
      </div>
    </div>
  );
}
