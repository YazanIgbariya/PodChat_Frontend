import React, { useEffect, useState } from "react";
import "./MyProfile.css";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Components
import ProfileHeader from "../components/MyProfileComponents/ProfileHeader";
import ProfileStatsRow from "../components/MyProfileComponents/ProfileStatsRow";
import ProfileTabs from "../components/MyProfileComponents/ProfileTabs";

export default function MyProfile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [myThreads, setMyThreads] = useState([]);
  const [participatedThreads, setParticipatedThreads] = useState([]);
  const [messagesCount, setMessagesCount] = useState(0);
  const [friendsList, setFriendsList] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [loading, setLoading] = useState(true);

  const isGoogleUser = user?.providerData?.[0]?.providerId === "google.com";

  const fetchParticipatedThreads = async () => {
    const allThreadsSnapshot = await getDocs(collection(db, "threads"));
    const participated = [];

    for (const docSnap of allThreadsSnapshot.docs) {
      const threadId = docSnap.id;
      const threadData = docSnap.data();

      const participantRef = doc(
        db,
        "threads",
        threadId,
        "participants",
        user.uid
      );
      const participantSnap = await getDoc(participantRef);

      if (participantSnap.exists()) {
        const messagesRef = collection(db, "threads", threadId, "messages");
        const msgSnap = await getDocs(messagesRef);

        const participantsRef = collection(
          db,
          "threads",
          threadId,
          "participants"
        );
        const participantsSnap = await getDocs(participantsRef);

        participated.push({
          id: threadId,
          ...threadData,
          messageCount: msgSnap.size,
          participantCount: participantsSnap.size,
        });
      }
    }

    setParticipatedThreads(participated);
  };

  useEffect(() => {
    const fetchUserProfileData = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);
        const data = snapshot.exists() ? snapshot.data() : {};

        const finalData = {
          id: user.uid,
          name: data.name || data.displayName || user.displayName || "No Name",
          photoURL: data.photoURL || user.photoURL || "",
          email: data.email || user.email || "",
          joinedAt: data.joinedAt || null,
          customPfp: data.customPfp || false,
        };
        setUserData(finalData);

        // My threads
        const threadsQuery = query(
          collection(db, "threads"),
          where("createdBy", "==", user.uid)
        );
        const threadsSnapshot = await getDocs(threadsQuery);

        const myCreatedThreads = await Promise.all(
          threadsSnapshot.docs.map(async (docSnap) => {
            const threadData = docSnap.data();

            const messagesRef = collection(
              db,
              "threads",
              docSnap.id,
              "messages"
            );
            const msgSnap = await getDocs(messagesRef);

            const participantsRef = collection(
              db,
              "threads",
              docSnap.id,
              "participants"
            );
            const participantsSnap = await getDocs(participantsRef);

            return {
              id: docSnap.id,
              ...threadData,
              messageCount: msgSnap.size,
              participantCount: participantsSnap.size,
            };
          })
        );

        setMyThreads(myCreatedThreads);

        // Activity
        const activityQuery = query(
          collection(db, "userActivity"),
          where("userId", "==", user.uid)
        );
        const activitySnap = await getDocs(activityQuery);
        const activity = activitySnap.docs
          .map((doc) => doc.data())
          .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
        setActivityList(activity);

        // ✅ Count actual messages sent
        const messagesSent = activity.filter(
          (entry) => entry.type === "sent_message"
        );
        setMessagesCount(messagesSent.length);

        // Participated threads
        await fetchParticipatedThreads();

        // Friends
        const friendsRef = collection(db, "users", user.uid, "friends");
        const friendsSnap = await getDocs(friendsRef);
        const friendList = await Promise.all(
          friendsSnap.docs.map(async (docSnap) => {
            const fid = docSnap.id;
            const fRef = doc(db, "users", fid);
            const fSnap = await getDoc(fRef);
            return fSnap.exists()
              ? {
                  id: fid,
                  name:
                    fSnap.data().name || fSnap.data().displayName || "Unknown",
                  photoURL: fSnap.data().photoURL || "/default-avatar.png",
                }
              : null;
          })
        );
        setFriendsList(friendList.filter(Boolean));
      } catch (err) {
        console.error("Failed to load profile:", err);
      }

      setLoading(false);
    };

    fetchUserProfileData();
  }, [user]);

  const handleUnfriend = async (friendId) => {
    try {
      const ref = doc(db, "users", user.uid, "friends", friendId);
      await deleteDoc(ref);
      setFriendsList((prev) => prev.filter((f) => f.id !== friendId));
    } catch (err) {
      console.error("Failed to unfriend:", err);
    }
  };

  if (loading || !user || !userData) {
    return <div className="myprofile-container">Loading profile...</div>;
  }

  return (
    <div className="myprofile-container">
      <ProfileHeader
        user={userData}
        isGoogleUser={isGoogleUser}
        isOwnProfile={true}
      />

      <ProfileStatsRow
        stats={{
          threads: myThreads.length,
          messages: messagesCount,
          friends: friendsList.length,
        }}
      />
      <ProfileTabs
        myThreads={myThreads}
        setMyThreads={setMyThreads}
        participatedThreads={participatedThreads}
        setParticipatedThreads={setParticipatedThreads}
        friends={friendsList}
        activity={activityList}
        onUnfriend={handleUnfriend}
        isOwnProfile={true}
        onTabChange={(tab) => {
          if (tab === "participated") fetchParticipatedThreads();
        }}
      />
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );
}
