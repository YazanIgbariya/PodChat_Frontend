import React from "react";
import "./UserPopup.css";
import { useNavigate } from "react-router-dom";

export default function UserPopup({ user, onClose, onAddFriend, isFriend }) {
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <img
          src={user.photoURL || "/default-avatar.png"}
          alt="Avatar"
          className="popup-avatar"
        />
        <h3>{user.name || user.displayName || "No Name"}</h3>
        <div className="popup-actions">
          <button onClick={() => navigate(`/profile/${user.id}`)}>
            View Profile
          </button>
          {!isFriend && (
            <button onClick={() => onAddFriend(user.id)}>Follow</button>
          )}
        </div>
        <button className="popup-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
