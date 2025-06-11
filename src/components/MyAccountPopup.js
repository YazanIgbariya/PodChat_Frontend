import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./MyAccountPopup.css";

export default function MyAccountPopup({ onClose, setDarkMode }) {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("Loading...");

  useEffect(() => {
    const fetchDisplayName = async () => {
      const uid = user?.uid;
      if (!uid) return;

      try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setDisplayName(data.name || data.displayName || "Unknown User");
        } else {
          setDisplayName("Unknown User");
        }
      } catch (err) {
        console.error("Failed to fetch display name:", err);
        setDisplayName("Unknown User");
      }
    };

    fetchDisplayName();
  }, [user]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      setDarkMode(false); // Still switch visually
      document.body.classList.remove("dark");
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

        <div className="popup-name">{displayName}</div>
        <div className="popup-email">{user?.email || "No email"}</div>
      </div>

      <div className="popup-actions">
        <button
          onClick={() => {
            navigate("/profile");
            onClose();
          }}
        >
          My Profile
        </button>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
