import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Notifications from "./components/Notification";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TimeTableChart from "./components/TimeTableChart";
import Timetable from "./pages/Timetable";
import AutoTimetable from "./pages/Automatic";

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

function MainLayout() {
  const location = useLocation();
  
  // Hide Sidebar on Login & Signup pages
  const hideSidebar = location.pathname === "/" || location.pathname === "/signup";

  return (
    <div style={{ display: "flex" }}>
      {!hideSidebar && <Sidebar />}
      <div style={{ marginLeft: hideSidebar ? "0" : "260px", padding: "20px", width: "100%" }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/timetablechart" element={<TimeTableChart />} />
          <Route path="/auto-timetable" element={<AutoTimetable />} />
          <Route path="/timetable" element={<Timetable/>} />

        </Routes>
      </div>
    </div>
  );
}

export default App;
