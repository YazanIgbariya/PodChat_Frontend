import React from "react";
import "./ActivityTimeline.css";

export default function ActivityTimeline({ activity }) {
  if (!activity || activity.length === 0) {
    return <p className="empty-tab">No recent activity.</p>;
  }

  return (
    <div className="activity-timeline">
      <ul className="timeline-list">
        {activity.map((item, index) => (
          <li key={index} className="timeline-item">
            <div className="activity-dot"></div>
            <div className="activity-details">
              <p className="activity-desc">
                {item.type === "created_thread" && (
                  <>
                    🧵 Created thread <strong>{item.threadTitle}</strong>
                  </>
                )}
                {item.type === "sent_message" && (
                  <>
                    💬 Sent a message in <strong>{item.threadTitle}</strong>
                  </>
                )}
              </p>
              <p className="activity-time">
                {item.timestamp?.toDate().toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
