import React, { useState, useEffect, useRef } from "react";
import "./ChatDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import axios from "axios";
import dayjs from "dayjs";
import WordCloudModal from "../components/WordCloudModal";
import IntentStatsModal from "../components/IntentStatsModal";

import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  sendMessage,
  listenToMessages,
  isUserInThread,
} from "../firebaseUtils";
import { api } from "../api"; //

import TextareaAutosize from "react-textarea-autosize";
import UserPopup from "../components/UserPopup";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import { MdInsights, MdVisibility, MdVisibilityOff } from "react-icons/md";
import ThreadMenuPopup from "../components/ThreadMenuPopup";
import TopContributorsModal from "../components/TopContributorsModal";
import EngagementGraphModal from "../components/EngagementGraphModal";

export const ChatDetails = () => {
  const navigate = useNavigate();
  const { threadId } = useParams();

  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [showContributorsModal, setShowContributorsModal] = useState(false);
  const [showEngagementModal, setShowEngagementModal] = useState(false);
  const [lastSummaryTime, setLastSummaryTime] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showWordCloudModal, setShowWordCloudModal] = useState(false);
  const [wordCloudData, setWordCloudData] = useState([]);
  const [showIntent, setShowIntent] = useState(() => {
    return localStorage.getItem("showIntent") !== "false";
  });
  const [showIntentStatsModal, setShowIntentStatsModal] = useState(false);

  const statsRef = useRef(null);
  const popupRef = useRef(null);
  const bottomRef = useRef(null);

  const fetchThread = async () => {
    if (!threadId) return;
    const threadRef = doc(db, "threads", threadId);
    const snapshot = await getDoc(threadRef);
    if (snapshot.exists()) {
      const threadData = snapshot.data();

      const participantsRef = collection(
        db,
        "threads",
        threadId,
        "participants"
      );
      const participantsSnap = await getDocs(participantsRef);

      setThread({
        id: snapshot.id,
        ...threadData,
        participants: participantsSnap.size,
      });
      if (threadData.lastSummaryAt) {
        setLastSummaryTime(threadData.lastSummaryAt.toDate());
      }
    } else {
      setThread(null);
    }
  };

  const canSummarize =
    !lastSummaryTime || dayjs().diff(dayjs(lastSummaryTime), "minute") >= 30;

  const handleSummarize = async () => {
    if (!canSummarize || isSummarizing || !threadId) return;

    try {
      setIsSummarizing(true);

      const res = await axios.post("http://localhost:5000/summarize", {
        threadId,
        triggeredByCreator: true,
      });

      if (res.data?.summary) {
        // Update local thread state
        setThread((prev) => ({
          ...prev,
          summary: res.data.summary,
        }));

        // Refresh the last summary time
        setLastSummaryTime(new Date());
      }
    } catch (err) {
      console.error("Summarization failed", err);
      const status = err?.response?.status;
      const message = err?.response?.data?.error;

      if (status === 429) {
        alert(
          "🕒 You need 50 new messages since the last summary to summarize again."
        );
      } else if (status === 400) {
        alert(
          message ||
            "Not enough content to summarize. Please add more messages."
        );
      } else {
        alert(
          "⚠️ Something went wrong while summarizing. Please try again later."
        );
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;
    const unsubscribe = listenToMessages(threadId, setMessages);
    return () => unsubscribe();
  }, [threadId]);

  useEffect(() => {
    const maybeAutoSummarize = async () => {
      if (!threadId || !thread) return;

      const messageCount = messages.length;
      const lastSummaryCount = thread.lastSummaryMessageCount || 0;
      const newMessageCount = messageCount - lastSummaryCount;

      // Skip early if not enough new messages
      if (newMessageCount < 20) {
        console.log(
          `⏭️ Skipping auto-summarization: only ${newMessageCount} new messages`
        );
        return;
      }

      try {
        const res = await axios.post("http://localhost:5000/summarize", {
          threadId,
          triggeredByCreator: false,
        });

        if (res.data?.summary) {
          setThread((prev) => ({
            ...prev,
            summary: res.data.summary,
          }));
          setLastSummaryTime(new Date());
          console.log("Auto-summarization complete.");
        }
      } catch (err) {
        if (err?.response?.status === 429) {
          console.log(
            "Auto summarization skipped: 429 - Too soon or too few messages."
          );
        } else {
          console.error("Auto summarization failed:", err);
        }
      }
    };

    maybeAutoSummarize();
  }, [messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        setUserData(snapshot.data());
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    const checkParticipation = async () => {
      if (threadId && user?.uid && thread) {
        const result = await isUserInThread(threadId);
        setIsParticipant(result || thread.createdBy === user.uid);
      }
    };
    checkParticipation();
  }, [threadId, user, thread]);

  useEffect(() => {
    const ensureCreatorIsParticipant = async () => {
      if (!thread || !user?.uid) return;

      if (thread.createdBy === user.uid) {
        const ref = doc(db, "threads", thread.id, "participants", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await api.post(`/thread/${thread.id}/join`, { uid: user.uid });

          await fetchThread();
        }
      }
    };
    ensureCreatorIsParticipant();
  }, [thread, user]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !statsRef.current.contains(e.target)
      ) {
        setShowMenuPopup(false);
      }
    };
    if (showMenuPopup) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showMenuPopup]);

  const handleSend = async () => {
    if (!messageInput.trim() || !user || !userData || !threadId) return;

    await axios.post("http://localhost:5000/message/send", {
      threadId,
      senderId: user.uid,
      senderName: userData.name || user.displayName || "Anonymous",
      senderPhotoURL: user.photoURL || "",
      text: messageInput.trim(),
    });

    setMessageInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAvatarClick = async (userId) => {
    if (!userId || userId === user?.uid) return;

    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) return;

    const friendDoc = await getDoc(
      doc(db, "users", user.uid, "friends", userId)
    );
    setIsFriend(friendDoc.exists());
    setSelectedUser({ id: userId, ...snapshot.data() });
  };

  const handleAddFriend = async (targetId) => {
    if (!user || !targetId) return;

    await setDoc(doc(db, "users", user.uid, "friends", targetId), {
      addedAt: serverTimestamp(),
    });
    setIsFriend(true);
  };

  const handleLeaveThread = async () => {
    await api.post(`/thread/${thread.id}/leave`, { uid: user.uid });
    await fetchThread();
    setIsParticipant(false);
  };

  const handleJoinThread = async () => {
    await api.post(`/thread/${thread.id}/join`, { uid: user.uid });
    await fetchThread();
    setIsParticipant(true);
  };

  const toggleMenuPopup = () => setShowMenuPopup((prev) => !prev);

  const handleShowContributors = () => {
    setShowMenuPopup(false);
    setShowContributorsModal(true);
  };

  const handleShowEngagement = () => {
    setShowMenuPopup(false);
    setShowEngagementModal(true);
  };

  if (thread === null) {
    return (
      <div className="chat-details-container">
        <p>Thread not found.</p>
      </div>
    );
  }

  const handleShowWordCloud = async () => {
    setShowMenuPopup(false);
    try {
      const res = await axios.post(
        `http://localhost:5000/thread/${thread.id}/wordcloud`
      );
      const words = Object.entries(res.data.frequencies).map(
        ([text, value]) => ({ text, value })
      );
      setWordCloudData(words);
      setShowWordCloudModal(true);
    } catch (err) {
      console.error("Failed to load word cloud:", err);
      alert("Failed to generate word cloud.");
    }
  };

  const toggleIntentDisplay = () => {
    const newState = !showIntent;
    setShowIntent(newState);
    localStorage.setItem("showIntent", newState);
  };

  return (
    <div className="chat-details-container">
      <div className="chat-header">
        <div className="chat-header-left">
          <button onClick={() => navigate("/discover")} className="back-button">
            ←
          </button>
          <h2>{thread.title}</h2>
        </div>
        <div className="chat-header-right">
          <span className={`status-badge ${thread.status?.toLowerCase()}`}>
            {thread.status}
          </span>
          <span className="participants-count">
            {thread.participants} participants
          </span>
          {isParticipant && (
            <>
              <div
                className="stats-button"
                ref={statsRef}
                onClick={toggleMenuPopup}
              >
                Details
                <MdInsights size={18} style={{ marginLeft: 10 }} />
              </div>
              {thread?.enableIntent !== false && (
                <button
                  className={`intent-toggle-button ${
                    !showIntent ? "inactive" : ""
                  }`}
                  onClick={toggleIntentDisplay}
                  title="Toggle intent classification visibility"
                >
                  {showIntent ? (
                    <MdVisibility
                      style={{
                        marginRight: 8,
                        marginBottom: 2,
                        verticalAlign: "middle",
                      }}
                      size={18}
                    />
                  ) : (
                    <MdVisibilityOff
                      style={{
                        marginRight: 8,
                        marginBottom: 2,
                        verticalAlign: "middle",
                      }}
                      size={18}
                    />
                  )}
                  {showIntent ? "Intents Enabled" : "Intents Hidden"}
                </button>
              )}

              {user?.uid === thread.createdBy && (
                <button
                  onClick={handleSummarize}
                  className="summarize-button"
                  disabled={!canSummarize || isSummarizing}
                  title={
                    !canSummarize
                      ? "You can summarize only once every 30 minutes."
                      : ""
                  }
                >
                  {isSummarizing ? "Summarizing..." : "Summarize"}
                </button>
              )}

              {showMenuPopup && (
                <ThreadMenuPopup
                  anchorRef={statsRef}
                  popupRef={popupRef}
                  onClose={() => setShowMenuPopup(false)}
                  onShowContributors={handleShowContributors}
                  onShowGraph={handleShowEngagement}
                  onLeave={handleLeaveThread}
                  onShowWordCloud={handleShowWordCloud}
                  onShowIntentStats={() => setShowIntentStatsModal(true)}
                />
              )}
            </>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="system-message">
            <span role="img" aria-label="empty">
              💬
            </span>{" "}
            This thread has no messages yet.
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <React.Fragment key={msg.id || index}>
                {msg.type === "summary" ? (
                  <div className="ai-summary">
                    <strong>AI Summary:</strong>
                    <p>{msg.text}</p>
                  </div>
                ) : (
                  <div
                    className={`chat-message ${
                      msg.senderId === user?.uid ? "right" : ""
                    }`}
                  >
                    <div
                      className={`bubble-row ${
                        msg.senderId === user?.uid
                          ? "bubble-right"
                          : "bubble-left"
                      }`}
                    >
                      <img
                        src={msg.senderPhotoURL || "/default-avatar.png"}
                        alt="avatar"
                        className="message-avatar"
                        onClick={() => handleAvatarClick(msg.senderId)}
                      />
                      <div className="message-wrapper">
                        {thread?.enableIntent !== false &&
                          showIntent &&
                          msg.intent && (
                            <div
                              className={`message-intent intent-${msg.intent} ${
                                msg.senderId === user?.uid ? "right" : "left"
                              }`}
                            >
                              {msg.intent.replace("_", " ").toUpperCase()}
                            </div>
                          )}

                        <div className="message-bubble">
                          <div
                            className="message-author"
                            style={{
                              textAlign:
                                msg.senderId === user?.uid ? "right" : "left",
                            }}
                          >
                            {msg.senderName}
                          </div>
                          <div className="message-text">{msg.text}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </>
        )}

        <div ref={bottomRef} />
        {isSummarizing && (
          <div className="summary-typing-indicator">
            Summarizing chat, please wait
            <span className="dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        )}
      </div>

      {isParticipant ? (
        <div className="chat-input-area">
          <TextareaAutosize
            className="chat-textarea"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            minRows={1}
            maxRows={5}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSend}
            disabled={!messageInput.trim() || !userData}
            sx={{
              backgroundColor: "white",
              color: "#152238",
              textTransform: "none",
              borderRadius: "20px",
              padding: "6px 18px",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "#1d2b4a",
                color: "white",
              },
            }}
          >
            Send
          </Button>
        </div>
      ) : (
        <div className="chat-join-banner">
          <button onClick={handleJoinThread}>Join Thread to Participate</button>
        </div>
      )}

      <p className="input-note">Only participants can send messages</p>

      {selectedUser && (
        <UserPopup
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onAddFriend={handleAddFriend}
          isFriend={isFriend}
        />
      )}

      {showContributorsModal && (
        <TopContributorsModal
          messages={messages}
          onClose={() => setShowContributorsModal(false)}
        />
      )}

      {showEngagementModal && (
        <EngagementGraphModal
          messages={messages}
          onClose={() => setShowEngagementModal(false)}
        />
      )}

      {showWordCloudModal && (
        <WordCloudModal
          words={wordCloudData}
          onClose={() => setShowWordCloudModal(false)}
        />
      )}

      {showIntentStatsModal && (
        <IntentStatsModal
          messages={messages}
          onClose={() => setShowIntentStatsModal(false)}
        />
      )}
    </div>
  );
};
