import React from "react";
import "./IntentStatsModal.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const intentColors = {
  question: "#005bb5",
  answer: "#056608",
  opinion: "#b76b00",
  agree: "#217a00",
  disagree: "#cc0000",
  suggestion: "#1e3a8a",
  off_topic: "#666666",
  reaction: "#72198b",
};
export default function IntentStatsModal({ messages, onClose }) {
  const intentCounts = {};
  messages.forEach((msg) => {
    if (!msg.intent) return;
    intentCounts[msg.intent] = (intentCounts[msg.intent] || 0) + 1;
  });

  const chartData = Object.entries(intentCounts).map(([intent, count]) => ({
    intent,
    count,
    fill: intentColors[intent] || "#8884d8",
  }));

  return (
    <div className="intent-modal-overlay">
      <div className="intent-modal-content">
        <h3>Intent Statistics</h3>
        {chartData.length === 0 ? (
          <p>No classified messages available for this thread.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="intent" />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => `${value} messages`}
                contentStyle={{
                  backgroundColor: "#1d2b4a",
                  borderRadius: "8px",
                  border: "none",
                  color: "white",
                }}
                labelStyle={{
                  color: "white",
                  fontWeight: "bold",
                }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                fill={({ payload }) => payload.fill}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
        <button onClick={onClose} className="intent-close-button">
          Close
        </button>
      </div>
    </div>
  );
}
