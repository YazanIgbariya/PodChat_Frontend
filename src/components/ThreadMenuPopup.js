import React, { useEffect, useState } from "react";
import "./ThreadMenuPopup.css";
import {
  MdBarChart,
  MdPeopleAlt,
  MdLogout,
  MdClose,
  MdCloud,
} from "react-icons/md";

const ThreadMenuPopup = ({
  anchorRef,
  popupRef,
  onClose,
  onShowContributors,
  onShowGraph,
  onLeave,
  onShowWordCloud,
  onShowIntentStats,
  onShowRougeModal,
  isAdmin = false,
}) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left });
    }
  }, [anchorRef]);

  return (
    <div
      className="thread-menu-popup fade-in"
      ref={popupRef}
      style={{ top: pos.top, left: pos.left }}
    >
      <button onClick={onShowGraph}>
        <MdBarChart size={18} style={{ marginRight: 8 }} />
        View Engagement Graph
      </button>
      <button onClick={onShowIntentStats}>
        <MdBarChart size={18} style={{ marginRight: 8 }} />
        View Intent Stats
      </button>
      <button onClick={onShowContributors}>
        <MdPeopleAlt size={18} style={{ marginRight: 8 }} />
        View Top Contributors
      </button>
      <button onClick={onShowWordCloud}>
        <MdCloud size={18} style={{ marginRight: 8 }} />
        View Word Cloud
      </button>
      {isAdmin && (
        <button onClick={onShowRougeModal}>
          <MdBarChart size={18} style={{ marginRight: 8 }} />
          View ROUGE Summary Quality
        </button>
      )}

      <button onClick={onLeave} className="leave-button">
        <MdLogout size={18} style={{ marginRight: 8 }} />
        Leave Thread
      </button>
      <button onClick={onClose} className="close-button">
        <MdClose size={16} />
      </button>
    </div>
  );
};

export default ThreadMenuPopup;
