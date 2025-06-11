import React, { useState } from "react";
import "./NewRoomPopup.css";
import { auth } from "../firebase";
import { api } from "../api";

export default function NewRoomPopup({ onClose, onCreateThread }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [access, setAccess] = useState("public");
  const [enableAI, setEnableAI] = useState(false);
  const [enableIntent, setEnableIntent] = useState(true); // ✅ default ON
  const [allowAnon, setAllowAnon] = useState(false);

  const categoryOptions = [
    "Technology",
    "Science",
    "Sports",
    "Gaming",
    "Education",
    "News",
    "Business",
  ];

  const handleCreateThread = async () => {
    if (!title.trim()) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const res = await api.post("/thread", {
        title,
        description,
        category,
        createdBy: currentUser.uid,
        access,
        enableAI,
        allowAnon,
        enableIntent, // ✅ now included
      });

      const thread = res.data;

      if (onCreateThread) {
        onCreateThread({
          id: thread.id,
          title: thread.title,
          status: thread.status,
          participants: thread.participantCount,
          summary: thread.summary,
        });
      }

      onClose();
    } catch (err) {
      console.error("Failed to create thread:", err);
      alert("❌ Could not create thread. Try again.");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h3>New Chat Thread</h3>
          <button className="back-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="new-room-form">
          <div className="form-group">
            <label>Topic</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter thread topic"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this thread is about"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group radio-options">
            <label>Access Settings</label>
            {/* Placeholder: You can add more access options later */}
          </div>

          <div className="form-group toggles">
            <label>
              <input
                type="checkbox"
                checked={enableAI}
                onChange={() => setEnableAI(!enableAI)}
              />
              Enable AI Summary
            </label>
          </div>

          <div className="form-group toggles">
            <label>
              <input
                type="checkbox"
                checked={enableIntent}
                onChange={() => setEnableIntent(!enableIntent)}
              />
              Enable Intent Classification
            </label>
          </div>

          <button className="create-btn" onClick={handleCreateThread}>
            Create Thread
          </button>
        </div>
      </div>
    </div>
  );
}
