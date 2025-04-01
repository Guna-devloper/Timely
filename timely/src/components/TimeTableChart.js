import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import "./TimeTableChart.css"; // ✅ Custom styles

function TimeTableChart() {
  const [timetable, setTimetable] = useState([]);
  const [filteredTimetable, setFilteredTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "timetables"));
        const timetableData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            day: data.day || "Unknown Day",
            slots: Array.isArray(data.slots)
              ? data.slots
              : [
                  {
                    time: data.time || "N/A",
                    subject: data.subject || "N/A",
                    faculty: data.faculty || "N/A",
                    room: data.room || "N/A",
                  },
                ],
          };
        });

        console.log("📌 Retrieved Timetable Data:", JSON.stringify(timetableData, null, 2));

        if (!timetableData || timetableData.length === 0) {
          console.warn("⚠️ No timetable data found.");
          setTimetable([]);
          setFilteredTimetable([]);
        } else {
          setTimetable(timetableData);
          setFilteredTimetable(timetableData);
        }
      } catch (error) {
        console.error("❌ Error fetching timetable:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  // 🔍 Search and Filter Timetable
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    if (!value) {
      setFilteredTimetable(timetable);
      return;
    }

    const filtered = timetable.filter((entry) =>
      entry.day.toLowerCase().includes(value) ||
      entry.slots.some(
        (slot) =>
          slot.subject.toLowerCase().includes(value) ||
          slot.faculty.toLowerCase().includes(value)
      )
    );

    setFilteredTimetable(filtered);
  };

  return (
    <div className="container mt-4 timetable-container">
      <h2 className="text-center">📅 TimeTable Overview</h2>

      {/* 🔍 Search Bar & View Toggle */}
      <div className="d-flex justify-content-between align-items-center my-3">
        <Form.Control
          type="text"
          placeholder="🔍 Search by day, subject, or faculty..."
          value={search}
          onChange={handleSearch}
          className="search-bar"
        />
        <Button
          variant="outline-primary"
          onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
        >
          {viewMode === "table" ? "📋 Switch to Card View" : "📑 Switch to Table View"}
        </Button>
      </div>

      {/* 🔄 Loading Indicator */}
      {loading ? (
        <div className="text-center mt-3">
          <Spinner animation="border" variant="primary" />
          <p>Loading timetable...</p>
        </div>
      ) : filteredTimetable.length === 0 ? (
        <p className="text-center text-danger">⚠️ No timetable data available.</p>
      ) : viewMode === "table" ? (
        /* 📑 Table View */
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
            {filteredTimetable.map((dayEntry, index) =>
              dayEntry.slots.length > 0 ? (
                dayEntry.slots.map((slot, idx) => (
                  <tr key={`${index}-${idx}`}>
                    <td>{dayEntry.day || "Unknown"}</td>
                    <td>{slot?.time || "N/A"}</td>
                    <td>{slot?.subject || "N/A"}</td>
                    <td>{slot?.faculty || "N/A"}</td>
                    <td>{slot?.room || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr key={index}>
                  <td colSpan="5" className="text-center text-warning">
                    ⚠️ No slots available for {dayEntry.day}.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </Table>
      ) : (
        /* 🏷️ Card View */
        <div className="row">
          {filteredTimetable.map((dayEntry, index) => (
            <div className="col-md-4 mb-3" key={index}>
              <Card className="timetable-card">
                <Card.Body>
                  <Card.Title className="card-day">{dayEntry.day}</Card.Title>
                  {dayEntry.slots.length > 0 ? (
                    dayEntry.slots.map((slot, idx) => (
                      <Card.Text key={`${index}-${idx}`} className="card-slot">
                        <strong>Time:</strong> {slot.time} <br />
                        <strong>Subject:</strong> {slot.subject} <br />
                        <strong>Faculty:</strong> {slot.faculty} <br />
                        <strong>Room:</strong> {slot.room}
                      </Card.Text>
                    ))
                  ) : (
                    <p className="text-warning">⚠️ No slots available</p>
                  )}
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TimeTableChart;
