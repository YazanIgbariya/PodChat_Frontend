import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import ProfileHeader from "../components/MyProfileComponents/ProfileHeader";
import ProfileStatsRow from "../components/MyProfileComponents/ProfileStatsRow";
import ProfileTabs from "../components/MyProfileComponents/ProfileTabs";
import { api } from "../api";

export default function UserProfile() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [myThreads, setMyThreads] = useState([]);
  const [participatedThreads, setParticipatedThreads] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const isGoogleUser = userData?.provider === "google.com";

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
        userId
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

    return participated;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        const data = userSnap.exists() ? userSnap.data() : {};

        const userInfo = {
          id: userId,
          name: data.name || data.displayName || "No Name",
          photoURL: data.photoURL || "/default-avatar.png",
          email: data.email || "",
          joinedAt: data.joinedAt || null,
          customPfp: data.customPfp || false,
          provider: data.provider || "unknown",
        };
        setUserData(userInfo);

        const res = await api.get(`/user/${userId}/createdThreads`);
        const threads = await Promise.all(
          res.data.threads.map(async (thread) => {
            const msgSnap = await getDocs(
              collection(db, "threads", thread.id, "messages")
            );
            const participantsSnap = await getDocs(
              collection(db, "threads", thread.id, "participants")
            );

            return {
              ...thread,
              messageCount: msgSnap.size,
              participantCount: participantsSnap.size,
            };
          })
        );
        setMyThreads(threads);

        // Activity
        const activityQuery = query(
          collection(db, "userActivity"),
          where("userId", "==", userId)
        );
        const activitySnap = await getDocs(activityQuery);
        const activity = activitySnap.docs
          .map((doc) => doc.data())
          .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
        setActivityList(activity);

        // Friends
        const friendsRef = collection(db, "users", userId, "friends");
        const friendsSnap = await getDocs(friendsRef);
        const friends = await Promise.all(
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
        setFriendsList(friends.filter(Boolean));

        // Participated threads
        const participated = await fetchParticipatedThreads();
        setParticipatedThreads(participated);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };

    fetchUserData();
  }, [userId]);

  if (!userData) {
    return <div className="myprofile-container">Loading profile...</div>;
  }

  return (
    <div className="myprofile-container">
      <ProfileHeader
        user={userData}
        isGoogleUser={isGoogleUser}
        isOwnProfile={currentUser?.uid === userId}
      />

      <ProfileStatsRow
        stats={{
          threads: myThreads.length,
          messages: activityList.filter((a) => a.type === "sent_message")
            .length,
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
        isOwnProfile={false}
        onTabChange={(tab) => {
          if (tab === "participated") {
            fetchParticipatedThreads().then((data) =>
              setParticipatedThreads(data)
            );
          }
        }}
      />
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );
}
