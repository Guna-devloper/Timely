import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import "./TimeTableChart.css";

function TimeTableChart() {
  const [adminTimetable, setAdminTimetable] = useState([]);
  const [autoTimetable, setAutoTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        setLoading(true);

        // 🔹 Fetch Admin Timetable
        const adminSnapshot = await getDocs(collection(db, "timetables"));
        const adminData = adminSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            day: data.day || "Unknown Day",
            slots: Array.isArray(data.slots) ? data.slots : [],
          };
        });

        setAdminTimetable(adminData);

        // 🔹 Fetch Auto Scheduled Timetable
        const autoSnapshot = await getDocs(collection(db, "autoschedule"));
        const autoData = autoSnapshot.docs.map((doc) => {
          const data = doc.data();
          
          console.log(`✅ Auto Timetable for ${data.day}:`, data); // Debugging line

          return {
            id: doc.id,
            day: data.day || "Unknown Day",
            slots: Array.isArray(data.slots) && data.slots.length > 0 ? data.slots : ["Free", "Free", "Free", "Free", "Free", "Free"],
          };
        });

        setAutoTimetable(autoData);
      } catch (error) {
        console.error("❌ Error fetching timetable:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, []);

  // 🔍 Search Functionality
  const handleSearch = (e) => {
    setSearch(e.target.value.toLowerCase());
  };

  // Define the periods
  const periods = ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6"];

  return (
    <div className="container mt-4 timetable-container">
      <h2 className="text-center">📅 TimeTable Management</h2>

      {/* 🔍 Search Bar */}
      <div className="d-flex justify-content-between align-items-center my-3">
        <Form.Control
          type="text"
          placeholder="🔍 Search timetable..."
          value={search}
          onChange={handleSearch}
          className="search-bar"
        />
      </div>

      {/* 🔄 Loading Spinner */}
      {loading ? (
        <div className="text-center mt-3">
          <Spinner animation="border" variant="primary" />
          <p>Loading timetable...</p>
        </div>
      ) : (
        <>
          {/* 📌 Admin Managed Timetable */}
          <h3 className="text-primary mt-4">📌 Admin Managed Timetable</h3>
          <Table striped bordered hover responsive className="mt-3 timetable-table">
            <thead className="table-dark">
              <tr>
                <th>Day</th>
                <th>Time Slot</th>
                <th>Subject</th>
                <th>Faculty</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {adminTimetable.length > 0 ? (
                adminTimetable.map((dayEntry, index) =>
                  dayEntry.slots.map((slot, idx) => (
                    <tr key={`${index}-${idx}`}>
                      <td>{dayEntry.day}</td>
                      <td>{slot.time}</td>
                      <td>{slot.subject}</td>
                      <td>{slot.faculty}</td>
                      <td>{slot.room}</td>
                    </tr>
                  ))
                )
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-warning">
                    ⚠️ No admin timetable data available.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* ⚡ Automatically Scheduled Timetable */}
          <h3 className="text-success mt-4">⚡ Automatically Scheduled Timetable</h3>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>Day</th>
                {periods.map((p, index) => (
                  <th key={index}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {autoTimetable.length > 0 ? (
                autoTimetable.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.day}</td>
                    {periods.map((_, idx) => (
                      <td key={idx}>{entry.slots[idx] || "Free"}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={periods.length + 1} className="text-center text-warning">
                    ⚠️ No auto-generated timetable available.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
}

export default TimeTableChart;
