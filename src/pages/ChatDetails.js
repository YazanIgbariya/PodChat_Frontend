import React, { useState } from "react";
import "./ChatDetails.css";
import { useLocation, useNavigate } from "react-router-dom";

export const ChatDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Thread object passed from Discover/ThreadCard
  const thread = state?.thread || {
    title: "Unknown Thread",
    status: "Live",
    participants: 0,
    summary: "No summary available.",
  };

  const [messageInput, setMessageInput] = useState("");

  return (
    <div className="chat-details-container">
      <div className="chat-header">
        <div className="chat-header-left">
          <button onClick={() => navigate("/discover")} className="back-button">
            ←
          </button>
          <h2>{thread.title}</h2>
        </div>
        <div>
          <span className="status-badge">{thread.status}</span>
          <span className="participants-count">
            {thread.participants} participants
          </span>
        </div>
      </div>

      <div className="chat-messages">
        <div className="system-message">
          <span role="img" aria-label="empty">
            💬
          </span>{" "}
          This thread has no messages yet.
        </div>

        {thread.summary && (
          <div className="ai-summary">
            <strong>AI Summary</strong>
            <p>{thread.summary}</p>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <button
          className="send-button"
          disabled={!messageInput.trim()}
          onClick={() => {
            console.log("Send:", messageInput);
            setMessageInput("");
          }}
        >
          ➤
        </button>
      </div>

      <p className="input-note">Only participants can send messages</p>
    </div>
  );
};
