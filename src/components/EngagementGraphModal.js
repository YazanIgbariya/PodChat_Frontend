import React from "react";
import "./EngagementGraphModal.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const EngagementGraphModal = ({ messages, onClose }) => {
  const grouped = {};

  messages.forEach((msg) => {
    if (!msg.timestamp?.seconds) return;
    const date = new Date(msg.timestamp.seconds * 1000);
    const label = date.toLocaleDateString(); // Group by day only
    grouped[label] = (grouped[label] || 0) + 1;
  });

  const chartData = Object.entries(grouped)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => new Date(a.time) - new Date(b.time))
    .slice(-10); // limit to last 10 days

  return (
    <div className="graph-modal-overlay">
      <div className="graph-modal-content">
        <h3>Engagement Over Time</h3>
        {chartData.length === 0 ? (
          <p style={{ marginTop: "20px" }}>No engagement data to display.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" angle={-20} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => `${value} messages`}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="count" fill="#1d2b4a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <button onClick={onClose} className="graph-close-button">
          Close
        </button>
      </div>
    </div>
  );
};

export default EngagementGraphModal;
