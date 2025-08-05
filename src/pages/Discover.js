import React, { useState, useEffect } from "react";
import "./Discover.css";
import ThreadCard from "../components/ThreadCard";
import NewRoomPopup from "../components/NewRoomPopup";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { api } from "../api";

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
  const [threads, setThreads] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [participatedThreadIds, setParticipatedThreadIds] = useState([]);

  useEffect(() => {
    const fetchParticipated = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const res = await api.get(`/user/${user.uid}/participatedThreads`);
        setParticipatedThreadIds(res.data.threadIds || []);
      } catch (err) {
        console.error("Failed to fetch participated threads", err);
      }
    };

    fetchParticipated();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "threads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setThreads(threadList);
    });

    return () => unsubscribe();
  }, []);

  const filteredThreads = threads.filter((thread) => {
    const matchesCategory =
      selectedCategory === "All Threads" ||
      thread.category === selectedCategory;

    const matchesSearch =
      thread.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleThreadDelete = (threadId) => {
    setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
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
          <ThreadCard
            key={thread.id}
            thread={thread}
            onDelete={handleThreadDelete}
            participatedThreadIds={participatedThreadIds}
          />
        ))}
      </div>

      {showPopup && (
        <NewRoomPopup
          onClose={() => setShowPopup(false)}
          onCreateThread={() => {}}
        />
      )}
    </div>
  );
};
