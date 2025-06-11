// src/components/TopContributorsModal.js
import React from "react";
import "./TopContributorsModal.css";

const TopContributorsModal = ({ messages, onClose }) => {
  const countByUser = {};

  messages.forEach((msg) => {
    if (!countByUser[msg.senderId]) {
      countByUser[msg.senderId] = {
        count: 0,
        name: msg.senderName,
        avatar: msg.senderPhotoURL || "/default-avatar.png",
      };
    }
    countByUser[msg.senderId].count += 1;
  });

  const sorted = Object.entries(countByUser)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="top-modal-overlay">
      <div className="top-modal-content">
        <h3>Top Contributors</h3>
        <ul className="top-list">
          {sorted.map(([id, user], index) => (
            <li key={id}>
              <img src={user.avatar} alt="avatar" className="top-avatar" />
              <span className="top-name">{user.name}</span>
              <span className="top-count">{user.count} messages</span>
              <span className="top-medal">{medals[index]}</span>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="top-close-button">
          Close
        </button>
      </div>
    </div>
  );
};

export default TopContributorsModal;
