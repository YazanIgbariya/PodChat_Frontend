import React, { useState, useEffect } from "react";
import "./ThreadCard.css";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { auth } from "../firebase";
import { api } from "../api";

export default function ThreadCard({
  thread,
  onDelete,
  participatedThreadIds = [],
}) {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const {
    id,
    title = "Untitled Thread",
    description = "No description provided.",
    status = "Active",
    participants = 0,
    createdAt,
    lastMessageTimestamp,
    createdBy,
    starredBy = [],
  } = thread;

  const [isFavorited, setIsFavorited] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [loadingParticipant, setLoadingParticipant] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    setIsFavorited(starredBy.includes(user.uid));
    setIsParticipant(participatedThreadIds.includes(id));
    setLoadingParticipant(false);
  }, [id, user, starredBy, participatedThreadIds]);

  const handleStarToggle = async (e) => {
    e.stopPropagation();
    if (!user) return;

    try {
      const updated = !isFavorited;
      await api.post(`/thread/${id}/star`, {
        uid: user.uid,
        starred: updated,
      });
      setIsFavorited(updated);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleJoin = async () => {
    try {
      await api.post(`/thread/${id}/join`, { uid: user.uid });
      setIsParticipant(true);
      navigate(`/chat/${id}`);
    } catch (err) {
      console.error("Failed to join thread:", err);
    }
  };

  const handleView = () => {
    navigate(`/chat/${id}`);
  };

  const handleLeave = async () => {
    try {
      await api.post(`/thread/${id}/leave`, { uid: user.uid });
      setIsParticipant(false);
    } catch (err) {
      console.error("Failed to leave thread:", err);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this thread?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/thread/${id}`, { data: { uid: user.uid } });
      onDelete?.(id);
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  const lastTimestamp = lastMessageTimestamp || createdAt;
  const time =
    lastTimestamp?.toDate && typeof lastTimestamp.toDate === "function"
      ? formatDistanceToNow(lastTimestamp.toDate(), { addSuffix: true })
      : "unknown";

  return (
    <div className="thread-card">
      <div className="thread-header">
        <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
        <div className="thread-meta">
          <span className="thread-time">{time}</span>
          <span
            className={`thread-star ${isFavorited ? "active" : ""}`}
            onClick={handleStarToggle}
          >
            {isFavorited ? "★" : "☆"}
          </span>
        </div>
      </div>

      <h3 className="thread-title">{title}</h3>
      <p className="thread-desc">{description}</p>

      <div className="thread-footer">
        <div className="avatars">
          {[...Array(participants)].map((_, i) => (
            <span key={i} className="avatar">
              👤
            </span>
          ))}
        </div>

        {user?.uid === createdBy ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="thread-action" onClick={handleView}>
              View
            </button>
            <button
              className="thread-action leave"
              onClick={handleDelete}
              style={{ backgroundColor: "#f44336" }}
            >
              Delete
            </button>
          </div>
        ) : loadingParticipant ? (
          <button className="thread-action" disabled>
            Loading...
          </button>
        ) : isParticipant ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="thread-action" onClick={handleView}>
              View
            </button>
            <button
              className="thread-action leave"
              onClick={handleLeave}
              style={{ backgroundColor: "#f44336", color: "white" }}
            >
              Leave
            </button>
          </div>
        ) : (
          <button className="thread-action" onClick={handleJoin}>
            Join Thread
          </button>
        )}
      </div>
    </div>
  );
}
