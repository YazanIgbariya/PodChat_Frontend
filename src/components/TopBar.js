import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import "./TopBar.css";
import MyAccountPopup from "./MyAccountPopup";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import { doc, updateDoc } from "firebase/firestore";

const DarkModeSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#aab4be",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#001e3c",
    width: 32,
    height: 32,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff"
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#aab4be",
    borderRadius: 20 / 2,
  },
}));

export const TopBar = ({ darkMode, setDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const hideRight = location.pathname === "/" || location.pathname === "/login";
  const hideTitle = location.pathname === "/" || location.pathname === "/login";

  const getTitle = () => {
    if (location.pathname.startsWith("/favorites")) return "Favorites";
    return "";
  };

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
          src={darkMode ? "/podchatlogodark.png" : "/podchatlogo.png"}
          alt="PodChat logo"
          className="topbar-logo"
        />
        <span className="topbar-appname">PodChat</span>
      </div>

      {!hideTitle && <div className="topbar-title">{getTitle()}</div>}

      {!hideRight && (
        <div className="topbar-right" ref={dropdownRef}>
          <div style={{ marginRight: "10px", marginTop: "-4px" }}>
            <DarkModeSwitch
              checked={darkMode}
              onChange={async () => {
                const newMode = !darkMode;
                setDarkMode(newMode);
                document.body.classList.toggle("dark", newMode);

                const currentUser = auth.currentUser;
                if (currentUser) {
                  const userRef = doc(db, "users", currentUser.uid);
                  await updateDoc(userRef, { darkMode: newMode });
                }
              }}
              inputProps={{ "aria-label": "Dark mode toggle" }}
            />
          </div>
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
            <MyAccountPopup
              onClose={() => setShowDropdown(false)}
              setDarkMode={setDarkMode}
            />
          )}
        </div>
      )}
    </div>
  );
};
