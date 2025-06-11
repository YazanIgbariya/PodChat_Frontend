import React, { useState } from "react";
import "./ProfileTabs.css";
import ThreadListCard from "./ThreadListCard";
import FriendList from "./FriendList";
import ActivityTimeline from "./ActivityTimeline";

export default function ProfileTabs({
  myThreads,
  setMyThreads,
  participatedThreads,
  setParticipatedThreads,
  friends,
  activity,
  onUnfriend,
  isOwnProfile = false, // renamed from readOnly
  onTabChange,
}) {
  const [activeTab, setActiveTab] = useState("my");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handleLeave = (leftId) => {
    setParticipatedThreads((prev) => prev.filter((t) => t.id !== leftId));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "my":
        return myThreads.length ? (
          myThreads.map((t) => (
            <ThreadListCard
              key={t.id}
              thread={t}
              onDelete={(deletedId) =>
                setMyThreads((prev) => prev.filter((th) => th.id !== deletedId))
              }
              isOwnProfile={isOwnProfile}
            />
          ))
        ) : (
          <p className="no-threads">You haven’t created any threads.</p>
        );
      case "participated":
        return participatedThreads.length ? (
          participatedThreads.map((t) => (
            <ThreadListCard
              key={t.id}
              thread={t}
              onLeave={handleLeave}
              isOwnProfile={isOwnProfile}
            />
          ))
        ) : (
          <p className="no-threads">You haven’t participated in any threads.</p>
        );
      case "friends":
        return (
          <FriendList
            friends={friends}
            onUnfriend={isOwnProfile ? onUnfriend : null}
            readOnly={!isOwnProfile}
          />
        );
      case "activity":
        return <ActivityTimeline activity={activity} />;
      default:
        return null;
    }
  };

  return (
    <div className="profile-tabs">
      <div className="tabs">
        <button
          className={activeTab === "my" ? "tab active" : "tab"}
          onClick={() => handleTabChange("my")}
        >
          My Threads
        </button>
        <button
          className={activeTab === "participated" ? "tab active" : "tab"}
          onClick={() => handleTabChange("participated")}
        >
          Participated
        </button>
        <button
          className={activeTab === "friends" ? "tab active" : "tab"}
          onClick={() => handleTabChange("friends")}
        >
          Following
        </button>
        <button
          className={activeTab === "activity" ? "tab active" : "tab"}
          onClick={() => handleTabChange("activity")}
        >
          Recent Activity
        </button>
      </div>

      <div className="tab-content">{renderContent()}</div>
    </div>
  );
}
