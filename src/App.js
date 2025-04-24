import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Discover } from "./pages/Discover";
import { ChatDetails } from "./pages/ChatDetails";
import { TopBar } from "./components/TopBar";

// Handles routing layout logic
function AppLayout() {
  const location = useLocation();

  const hideTopBar =
    location.pathname === "/" || location.pathname === "/login";

  return (
    <>
      {!hideTopBar && <TopBar />}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <TopBar />
              <Login />
            </>
          }
        />

        <Route path="/discover" element={<Discover />} />
        <Route path="/chat/:threadId" element={<ChatDetails />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
