import React, { useState } from "react";
import "./Discover.css";
import ThreadCard from "../components/ThreadCard";
import NewRoomPopup from "../components/NewRoomPopup";

// Dummy data to use in the meatime...
const initialThreads = [
  {
    id: 1,
    title: "The Future of AI in Healthcare",
    description:
      "Join the discussion about how artificial intelligence is transforming modern healthcare practices.",
    status: "Active",
    time: "2h ago",
    category: "Technology",
    participants: 5,
  },
  {
    id: 2,
    title: "Sustainable Living Tips",
    description:
      "A comprehensive discussion on practical ways to live more sustainably.",
    status: "Ended",
    time: "1d ago",
    category: "Science",
    participants: 4,
  },
  {
    id: 3,
    title: "Quantum Computing Basics",
    description:
      "A beginner-friendly breakdown of what quantum computing is and why it matters.",
    status: "Active",
    time: "3h ago",
    category: "Technology",
    participants: 3,
  },
];

// Categories used for filtering
const categories = [
  "All Threads",
  "Technology",
  "Science",
  "Sports",
  "Gaming",
  "Education",
  "News",
  "Business",
];

export const Discover = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Threads");
  const [searchQuery, setSearchQuery] = useState("");
  const [threads, setThreads] = useState(initialThreads);
  const [showPopup, setShowPopup] = useState(false);

  // Filters threads by category and search query
  const filteredThreads = threads.filter((thread) => {
    const matchesCategory =
      selectedCategory === "All Threads" ||
      thread.category === selectedCategory;

    const matchesSearch =
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Adds a new thread to the list
  const handleAddThread = (newThread) => {
    setThreads([newThread, ...threads]);
  };

  return (
    <div className="discover-wrapper">
      <div className="top-bar">
        <h2>Discover</h2>
        <input
          type="text"
          placeholder="Search threads..."
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="create-thread-btn"
          onClick={() => setShowPopup(true)}
        >
          + Create Thread
        </button>
      </div>

      <div className="category-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${
              selectedCategory === cat ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="thread-list">
        {filteredThreads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>

      {showPopup && (
        <NewRoomPopup
          onClose={() => setShowPopup(false)}
          onCreateThread={handleAddThread}
        />
      )}
    </div>
  );
};
