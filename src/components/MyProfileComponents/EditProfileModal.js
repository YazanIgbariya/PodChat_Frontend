import React, { useState } from "react";
import "./EditProfileModal.css";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function EditProfileModal({
  userId,
  currentName,
  onClose,
  onSave,
}) {
  const [newName, setNewName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { name: newName.trim() });
    onSave(newName.trim());
    setLoading(false);
    onClose();
  };

  return (
    <div className="modal-container">
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Edit Display Name</h3>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new name"
          />
          <div className="modal-actions">
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
