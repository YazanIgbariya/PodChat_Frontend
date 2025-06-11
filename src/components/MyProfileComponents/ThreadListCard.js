import React from "react";
import "./ThreadListCard.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { api } from "../../api"; // ✅ use backend

export default function ThreadListCard({ thread, onLeave, onDelete }) {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const isCreator = user?.uid === thread.createdBy;

  const handleLeave = async () => {
    try {
      await api.post(`/thread/${thread.id}/leave`, { uid: user.uid });
      onLeave?.(thread.id);
    } catch (err) {
      console.error("Failed to leave thread:", err);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this thread?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/thread/${thread.id}`, { data: { uid: user.uid } });
      onDelete?.(thread.id);
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  return (
    <div className="thread-card">
      <div className="thread-top">
        <h4>{thread.title}</h4>
        <span className={`status-badge ${thread.status?.toLowerCase()}`}>
          {thread.status}
        </span>
      </div>

      <p className="thread-date">
        {thread.createdAt?.toDate
          ? "Created on " +
            thread.createdAt.toDate().toLocaleDateString("en-GB")
          : "No date"}
      </p>

      <div className="thread-meta">
        <span>💬 {thread.messageCount ?? 0} messages</span>
        <span>👥 {thread.participantCount ?? 0} participants</span>
      </div>

      <div className="thread-actions">
        <button
          className="view-button"
          onClick={() => navigate(`/chat/${thread.id}`)}
        >
          View
        </button>
        {isCreator ? (
          <button className="delete-thread-button" onClick={handleDelete}>
            Delete
          </button>
        ) : (
          <button className="leave-thread-button" onClick={handleLeave}>
            Leave
          </button>
        )}
      </div>
    </div>
  );
}
