import React from "react";
import "./SideBar.css";
import { NavLink, useLocation } from "react-router-dom";
import { FaCompass, FaFire, FaClock, FaStar } from "react-icons/fa";

const SideBar = () => {
  const location = useLocation();
  const hiddenRoutes = ["/", "/login"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <div className="sidebar">
      <div
        className="sidebar-brand"
        onClick={() => (window.location.href = "/discover")}
      ></div>

      <NavLink to="/discover" className="sidebar-link">
        <FaCompass />
        Discover
      </NavLink>
      <NavLink to="/popular" className="sidebar-link">
        <FaFire />
        Popular
      </NavLink>
      <NavLink to="/new" className="sidebar-link">
        <FaClock />
        New
      </NavLink>
      <NavLink to="/starred" className="sidebar-link">
        <FaStar />
        Starred
      </NavLink>
    </div>
  );
};

export default SideBar;
