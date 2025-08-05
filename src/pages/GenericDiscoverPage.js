import React, { useState, useEffect } from "react";
import "./Discover.css";
import ThreadCard from "../components/ThreadCard";
import NewRoomPopup from "../components/NewRoomPopup";
import {
  collection,
  onSnapshot,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
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

export default function GenericDiscoverPage({ title, sortBy }) {
  const [selectedCategory, setSelectedCategory] = useState("All Threads");
  const [searchQuery, setSearchQuery] = useState("");
  const [threads, setThreads] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [participatedThreadIds, setParticipatedThreadIds] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchParticipated = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/user/${user.uid}/participatedThreads`);
        setParticipatedThreadIds(res.data.threadIds || []);
      } catch (err) {
        console.error("Failed to fetch participated threads", err);
      }
    };
    fetchParticipated();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "threads"),
      async (snapshot) => {
        const enriched = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const threadId = docSnap.id;
            const data = docSnap.data();

            const msgSnap = await getDocs(
              collection(db, "threads", threadId, "messages")
            );
            const participantsSnap = await getDocs(
              collection(db, "threads", threadId, "participants")
            );

            return {
              id: threadId,
              ...data,
              messageCount: msgSnap.size,
              participantCount: participantsSnap.size,
            };
          })
        );

        let sorted = enriched;

        if (sortBy === "participants") {
          sorted = enriched.sort(
            (a, b) => b.participantCount - a.participantCount
          );
        } else if (sortBy === "createdAt") {
          sorted = enriched.sort(
            (a, b) =>
              (b.createdAt?.toMillis?.() || 0) -
              (a.createdAt?.toMillis?.() || 0)
          );
        } else if (sortBy === "starred") {
          sorted = enriched.filter(
            (thread) =>
              Array.isArray(thread.starredBy) &&
              user?.uid &&
              thread.starredBy.includes(user.uid)
          );
        }

        setThreads(sorted);
      }
    );

    return () => unsubscribe();
  }, [sortBy, user]);

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
        <h2>{title}</h2>
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
}
