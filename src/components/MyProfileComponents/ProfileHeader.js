import React, { useState } from "react";
import "./ProfileHeader.css";
import EditProfileModal from "./EditProfileModal";

export default function ProfileHeader({
  user,
  isGoogleUser,
  isOwnProfile, // 👈 renamed
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name);

  const handleSave = (newName) => {
    setDisplayName(newName);
  };

  const joinedDate = user?.joinedAt?.seconds
    ? new Date(user.joinedAt.seconds * 1000).toLocaleDateString()
    : "Unknown";

  return (
    <div className="profile-header">
      <div className="profile-avatar-wrapper">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="avatar" className="profile-avatar" />
        ) : (
          <div className="profile-avatar-placeholder">👤</div>
        )}
        {!isGoogleUser && isOwnProfile && (
          <button className="upload-btn">Upload Photo</button>
        )}
      </div>

      <div className="profile-header-info">
        <div className="profile-header-top">
          <h2>{displayName || "No Name"}</h2>
          {isOwnProfile && (
            <button className="edit-btn" onClick={() => setShowEdit(true)}>
              Edit Profile
            </button>
          )}
        </div>

        {/* ✅ Show email only on your own profile */}
        {isOwnProfile && <p className="profile-email">{user?.email}</p>}

        <p className="profile-joined">Joined {joinedDate}</p>

        {showEdit && (
          <EditProfileModal
            userId={user?.id || user?.uid}
            currentName={displayName}
            onClose={() => setShowEdit(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
