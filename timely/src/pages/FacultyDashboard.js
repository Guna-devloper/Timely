import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

function FacultyDashboard() {
  const [timetable, setTimetable] = useState([]);
  const [filteredTimetable, setFilteredTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [facultyMessage, setFacultyMessage] = useState("");
  const [facultyName, setFacultyName] = useState("");

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

        setTimetable(timetableData);
        setFilteredTimetable(timetableData);
      } catch (error) {
        console.error("Error fetching timetable:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  // 🔍 Filter Timetable by Search Input
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

  // 📌 Handle Message Submission
  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!facultyMessage || !facultyName) {
      alert("Please enter your name and a message.");
      return;
    }

    try {
      await addDoc(collection(db, "faculty_messages"), {
        facultyName,
        message: facultyMessage,
        timestamp: serverTimestamp(),
      });

      alert("Message sent successfully!");
      setFacultyMessage(""); // Clear message input after submission
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center">📅 Faculty Timetable</h3>

      {/* 🔍 Search Input */}
      <Form.Control
        type="text"
        placeholder="Search by day, subject, or faculty..."
        value={search}
        onChange={handleSearch}
        className="mb-3"
      />

      {/* 🔄 Loading Indicator */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Loading timetable...</p>
        </div>
      ) : filteredTimetable.length === 0 ? (
        <p className="text-center text-danger">⚠️ No timetable data available.</p>
      ) : (
        /* 📋 Table View */
        <Table striped bordered hover responsive className="mt-3">
          <thead className="table-dark">
            <tr>
              <th>Day</th>
              <th>Time</th>
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
      )}

      {/* 🔹 Faculty Message Section */}
      <h3 className="text-center mt-5">📩 Faculty Notes & Updates</h3>

      <Card className="shadow-sm p-3 mt-3">
        <Form onSubmit={handleMessageSubmit}>
          <Form.Group className="mb-3">
            <Form.Label><strong>Your Name (Faculty):</strong></Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name..."
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label><strong>Message:</strong></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter notes, timetable updates, or important messages..."
              value={facultyMessage}
              onChange={(e) => setFacultyMessage(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Submit Message
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default FacultyDashboard;
