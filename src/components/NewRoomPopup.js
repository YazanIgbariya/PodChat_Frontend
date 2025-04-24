import React, { useState } from "react";
import "./NewRoomPopup.css";

export default function NewRoomPopup({ onClose, onCreateThread }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [access, setAccess] = useState("public");
  const [enableAI, setEnableAI] = useState(false);
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

  const handleCreateThread = () => {
    if (!title.trim()) return;
    const newThread = {
      id: Date.now(),
      title,
      description,
      category,
      status: "Active",
      time: "Just now",
      participants: 1,
    };
    if (onCreateThread) {
      onCreateThread(newThread);
    }
    onClose();
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
            <label>
              <input
                type="radio"
                name="access"
                value="public"
                checked={access === "public"}
                onChange={() => setAccess("public")}
              />
              Open to everyone
            </label>
            <label>
              <input
                type="radio"
                name="access"
                value="private"
                checked={access === "private"}
                onChange={() => setAccess("private")}
              />
              Invite only
            </label>
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
            <label>
              <input
                type="checkbox"
                checked={allowAnon}
                onChange={() => setAllowAnon(!allowAnon)}
              />
              Allow Anonymous Messages
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
