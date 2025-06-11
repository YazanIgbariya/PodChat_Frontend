// App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Discover } from "./pages/Discover";
import { ChatDetails } from "./pages/ChatDetails";
import MyProfile from "./pages/MyProfile";
import { TopBar } from "./components/TopBar";
import UserProfile from "./pages/UserProfile";
import SideBar from "./components/SideBar";
import Popular from "./pages/Popular";
import New from "./pages/New";
import Starred from "./pages/Starred";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function LayoutWrapper({ children, darkMode, setDarkMode }) {
  const location = useLocation();
  const hideSidebar = location.pathname === "/login";

  return (
    <div style={{ display: "flex" }}>
      {!hideSidebar && <SideBar />}
      <div style={{ flex: 1 }}>
        <TopBar darkMode={darkMode} setDarkMode={setDarkMode} />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  // 👇 Listen to login and fetch user's theme
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const savedMode = !!snap.data().darkMode;
            setDarkMode(savedMode);
            document.body.classList.toggle("dark", savedMode);
          }
        } catch (err) {
          console.error("Failed to fetch user theme:", err);
        }
      } else {
        // On logout, visually reset theme (but do NOT delete from Firestore!)
        setDarkMode(false);
        document.body.classList.remove("dark");
      }
    });

    return () => unsubscribe();
  }, []);

  // Ensure class always follows state
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <Router>
      <LayoutWrapper darkMode={darkMode} setDarkMode={setDarkMode}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/chat/:threadId" element={<ChatDetails />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/popular" element={<Popular />} />
          <Route path="/new" element={<New />} />
          <Route path="/starred" element={<Starred />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}
