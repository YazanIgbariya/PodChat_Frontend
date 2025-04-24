import React, { useState } from "react";
import "./ThreadCard.css";
import { useNavigate } from "react-router-dom";

export default function ThreadCard({ thread }) {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);

  // Handle thread card click
  const handleClick = () => {
    if (thread.status === "Active") {
      navigate(`/chat/${thread.id}`, { state: { thread } });
    } else {
      alert("Summary page not built yet.");
    }
  };

  return (
    <div className="thread-card">
      <div className="thread-header">
        <span className={`status-badge ${thread.status.toLowerCase()}`}>
          {thread.status}
        </span>
        <div className="thread-meta">
          <span className="thread-time">{thread.time}</span>
          <span
            className={`thread-star ${isFavorited ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
          >
            {isFavorited ? "★" : "☆"}
          </span>
        </div>
      </div>

      <h3 className="thread-title">{thread.title}</h3>
      <p className="thread-desc">{thread.description}</p>

      <div className="thread-footer">
        <div className="avatars">
          {[...Array(thread.participants)].map((_, i) => (
            <span key={i} className="avatar">
              👤
            </span>
          ))}
        </div>

        <button className="thread-action" onClick={handleClick}>
          {thread.status === "Active" ? "Join Thread" : "View Summary"}
        </button>
      </div>
    </div>
  );
}
