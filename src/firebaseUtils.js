import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { auth } from "./firebase";

//  Save user if not exists
export const saveUserIfNew = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      provider: user.providerData?.[0]?.providerId || "unknown",
      joinedAt: serverTimestamp(),
      bio: "",
      customPfp: false,
    });
  }
};

//  Create a thread in /threads and log activity
export const createThread = async (threadData) => {
  const threadRef = await addDoc(collection(db, "threads"), {
    ...threadData,
    createdAt: serverTimestamp(),
    summary: null,
  });

  await addDoc(collection(db, "userActivity"), {
    userId: threadData.createdBy,
    type: "created_thread",
    threadId: threadRef.id,
    threadTitle: threadData.title || "Untitled Thread",
    timestamp: serverTimestamp(),
  });

  return threadRef;
};

//  Send message and log activity
export const sendMessage = async (threadId, messageData) => {
  const messageRef = collection(db, "threads", threadId, "messages");

  const msgDoc = await addDoc(messageRef, {
    ...messageData,
    timestamp: serverTimestamp(),
    intent: null,
  });

  const threadRef = doc(db, "threads", threadId);
  await updateDoc(threadRef, {
    lastMessageTimestamp: serverTimestamp(),
  });

  const threadSnap = await getDoc(threadRef);
  const threadTitle = threadSnap.exists() ? threadSnap.data().title : "Unknown";

  await addDoc(collection(db, "userActivity"), {
    userId: messageData.senderId,
    type: "sent_message",
    threadId,
    threadTitle,
    timestamp: serverTimestamp(),
  });

  return msgDoc.id;
};

//  Listen to real-time messages for a thread
export const listenToMessages = (threadId, onUpdate) => {
  const messagesRef = collection(db, "threads", threadId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    onUpdate(messages);
  });
};

// ✅ Join a thread
export const joinThread = async (threadId) => {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "threads", threadId, "participants", user.uid);
  await setDoc(ref, {
    userId: user.uid,
    displayName: user.displayName || "Anonymous",
    photoURL: user.photoURL || "",
    joinedAt: serverTimestamp(),
  });

  // Recalculate participant count
  const participantsSnap = await getDocs(
    collection(db, "threads", threadId, "participants")
  );

  await updateDoc(doc(db, "threads", threadId), {
    participants: participantsSnap.size,
  });
};

// ✅ Leave a thread
export const leaveThread = async (threadId) => {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "threads", threadId, "participants", user.uid);
  await deleteDoc(ref);

  // Recalculate participant count
  const participantsSnap = await getDocs(
    collection(db, "threads", threadId, "participants")
  );

  await updateDoc(doc(db, "threads", threadId), {
    participants: participantsSnap.size,
  });
};

// ✅ Check if user is a participant
export const isUserInThread = async (threadId) => {
  const user = auth.currentUser;
  if (!user) return false;

  const ref = doc(db, "threads", threadId, "participants", user.uid);
  const snap = await getDoc(ref);
  return snap.exists();
};

// ✅ Delete a thread and all its subcollections
export const deleteThread = async (threadId) => {
  const threadRef = doc(db, "threads", threadId);

  // Delete messages
  const messagesRef = collection(db, "threads", threadId, "messages");
  const messagesSnap = await getDocs(messagesRef);
  const deleteMessages = messagesSnap.docs.map((doc) => deleteDoc(doc.ref));

  // Delete participants
  const participantsRef = collection(db, "threads", threadId, "participants");
  const participantsSnap = await getDocs(participantsRef);
  const deleteParticipants = participantsSnap.docs.map((doc) =>
    deleteDoc(doc.ref)
  );

  // Delete userActivity logs related to this thread
  const activityRef = collection(db, "userActivity");
  const activitySnap = await getDocs(activityRef);
  const deleteActivities = activitySnap.docs
    .filter((doc) => doc.data().threadId === threadId)
    .map((doc) => deleteDoc(doc.ref));

  // Execute all deletions
  await Promise.all([
    ...deleteMessages,
    ...deleteParticipants,
    ...deleteActivities,
  ]);

  // Finally delete the thread itself
  await deleteDoc(threadRef);
};

// ✅ Toggle starred status for a thread
export const toggleStarThread = async (
  threadId,
  userId,
  isCurrentlyStarred
) => {
  const threadRef = doc(db, "threads", threadId);
  await updateDoc(threadRef, {
    starredBy: isCurrentlyStarred ? arrayRemove(userId) : arrayUnion(userId),
  });
};
