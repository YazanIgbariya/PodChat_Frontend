import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./TopBar.css";
import MyAccountPopup from "./MyAccountPopup";

export const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [showDropdown, setShowDropdown] = useState(false); // toggles account popup
  const dropdownRef = useRef(); // used to detect clicks outside the popup

  // Hide the title and account on login page
  const hideRight = location.pathname === "/" || location.pathname === "/login";
  const hideTitle = location.pathname === "/" || location.pathname === "/login";

  // Sets center screen title based on current route
  const getTitle = () => {
    if (location.pathname.startsWith("/favorites")) return "Favorites";

    return "";
  };

  // Closes the account popup if user clicks outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="topbar-container">
      <div className="topbar-left" onClick={() => navigate("/discover")}>
        <img
          src="/podchatlogo.png"
          alt="PodChat logo"
          className="topbar-logo"
        />
        <span className="topbar-appname">PodChat</span>
      </div>

      {!hideTitle && <div className="topbar-title">{getTitle()}</div>}

      {!hideRight && (
        <div className="topbar-right" ref={dropdownRef}>
          <div
            className="topbar-account"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="topbar-pfp" />
            ) : (
              <div className="topbar-pfp">👤</div>
            )}
            <span>My Account</span>
          </div>

          {showDropdown && (
            <MyAccountPopup onClose={() => setShowDropdown(false)} />
          )}
        </div>
      )}
    </div>
  );
};
