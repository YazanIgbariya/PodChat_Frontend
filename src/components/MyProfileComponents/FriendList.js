// FriendList.js
import React from "react";
import "./FriendList.css";
import { useNavigate } from "react-router-dom";

export default function FriendList({ friends, onUnfriend, readOnly = false }) {
  const navigate = useNavigate();

  return (
    <div className="friend-list">
      <h3 className="section-title">My Friends</h3>
      {friends.length === 0 ? (
        <p className="no-friends">You haven’t added any friends yet.</p>
      ) : (
        <div className="friend-scroll-container">
          {friends.map((friend) => (
            <div key={friend.id} className="friend-row">
              <img
                src={friend.photoURL || "/default-avatar.png"}
                alt={friend.name || "Friend"}
                className="friend-pfp-img"
              />
              <div className="friend-info">
                <div className="friend-name">
                  {friend.name || friend.displayName || "No Name"}
                </div>
                <div className="friend-actions">
                  <button onClick={() => navigate(`/profile/${friend.id}`)}>
                    View Profile
                  </button>
                  {!readOnly && (
                    <button
                      className="unfriend-btn"
                      onClick={() => onUnfriend(friend.id)}
                    >
                      Unfollow
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
