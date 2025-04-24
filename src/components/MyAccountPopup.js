import React from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./MyAccountPopup.css";

export default function MyAccountPopup({ onClose }) {
  const user = auth.currentUser;
  const navigate = useNavigate();

  // Handles logout, then closes the popup and redirects to login
  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate("/");
      onClose();
    });
  };

  return (
    <div className="myaccount-popup">
      <div className="popup-header">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="User" className="popup-pfp" />
        ) : (
          <div className="popup-pfp">👤</div>
        )}
        <div className="popup-email">{user?.email || "Guest"}</div>
      </div>

      <div className="popup-actions">
        <button
          onClick={() => {
            navigate("/favorites");
            onClose();
          }}
        >
          ⭐ Favorites
        </button>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>
    </div>
  );
}
