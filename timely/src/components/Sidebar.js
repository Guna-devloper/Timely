import React from "react";
import { useAuth } from "../auth/AuthContext"; // Corrected import
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Import Firebase auth
import "./Sidebar.css";

function Sidebar() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <p>Loading...</p>; // Prevents errors when user is undefined
  }

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Firebase logout
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("❌ Logout failed:", error.message);
    }
  };

  return (
    <div className="sidebar">
      <h3>Timely</h3>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        {role === "admin" && <li><Link to="/admin-dashboard">Manage Timetable</Link></li>}
        {role === "faculty" && <li><Link to="/faculty-dashboard">My Schedule</Link></li>}
        {role === "student" && <li><Link to="/timetablechart">Class Schedule</Link></li>}
        <li><Link to="/notifications">Notifications</Link></li>
      </ul>

      {/* 🔴 Logout Button */}
      <button className="logout-btn" onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );
}

export default Sidebar;
