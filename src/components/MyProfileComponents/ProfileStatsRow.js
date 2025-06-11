import React from "react";
import "./ProfileStatsRow.css";

export default function ProfileStatsRow({ stats }) {
  return (
    <div className="stats-row">
      <div className="stat-box">
        <div className="stat-number">{stats.threads}</div>
        <div className="stat-label">Threads</div>
      </div>
      <div className="stat-box">
        <div className="stat-number">{stats.messages}</div>
        <div className="stat-label">Messages</div>
      </div>
      <div className="stat-box">
        <div className="stat-number">{stats.friends}</div>
        <div className="stat-label">Following</div>
      </div>
    </div>
  );
}
