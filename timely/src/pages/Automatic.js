import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { db } from "../firebase"; // Import Firestore instance
import { collection, addDoc, getDocs } from "firebase/firestore";

const AutoTimetable = () => {
  const [subjects, setSubjects] = useState([]); // Stores subjects with hours & faculty
  const [newSubject, setNewSubject] = useState("");
  const [newFaculty, setNewFaculty] = useState(""); // Faculty Name
  const [newCategory, setNewCategory] = useState("Language"); // Default category
  const [newHours, setNewHours] = useState("");
  const [schedule, setSchedule] = useState(null); // Initially null
  const [savedTimetables, setSavedTimetables] = useState([]); // Stores saved timetables

  const periods = [
    "9:00 - 9:55",
    "9:55 - 10:50",
    "11:15 - 12:05",
    "12:05 - 1:00",
    "2:00 - 3:00",
    "3:00 - 4:00",
  ];

  const categories = ["Language", "Major", "Lab"]; // System-defined categories

  const addSubject = () => {
    if (newSubject.trim() === "" || newFaculty.trim() === "" || newHours.trim() === "") {
      alert("Subject name, faculty, and hours cannot be empty!");
      return;
    }
    if (subjects.some((s) => s.name === newSubject)) {
      alert("Subject already added!");
      return;
    }

    setSubjects([
      ...subjects,
      { name: newSubject, faculty: newFaculty, category: newCategory, hours: parseInt(newHours) },
    ]);

    // Reset input fields
    setNewSubject("");
    setNewFaculty("");
    setNewHours("");
  };

  const generateTimetable = async () => {
    if (subjects.length === 0) {
      alert("Please add at least one subject before generating the timetable.");
      return;
    }

    let weeklySchedule = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
    let subjectList = [...subjects]; // Copy subjects to track remaining hours

    Object.keys(weeklySchedule).forEach((day) => {
      let dailyHours = 0;

      while (dailyHours < 6) {
        let subjectIndex = subjectList.findIndex((s) => s.hours > 0);
        if (subjectIndex === -1) break; // No subjects left

        let subject = subjectList[subjectIndex];

        if (subject.category === "Lab" && subject.hours >= 2 && dailyHours <= 4) {
          // Assign 2-hour blocks for labs
          weeklySchedule[day].push(`${subject.name} (Lab) - ${subject.faculty}`);
          weeklySchedule[day].push(`${subject.name} (Lab) - ${subject.faculty}`);
          subject.hours -= 2;
          dailyHours += 2;
        } else {
          // Assign 1-hour blocks for other subjects
          weeklySchedule[day].push(`${subject.name} - ${subject.faculty}`);
          subject.hours -= 1;
          dailyHours += 1;
        }

        if (subject.hours === 0) {
          subjectList.splice(subjectIndex, 1);
        }
      }
    });

    setSchedule(weeklySchedule);

    // Save timetable to Firestore
    try {
      await addDoc(collection(db, "autoschedule"), {
        timetable: weeklySchedule,
        timestamp: new Date(),
      });
      alert("Timetable saved successfully!");
      fetchTimetables(); // Refresh saved timetables
    } catch (error) {
      console.error("Error saving timetable:", error);
    }
  };

  // Fetch saved timetables from Firestore
  const fetchTimetables = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "autoschedule"));
      const timetables = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedTimetables(timetables);
    } catch (error) {
      console.error("Error fetching timetables:", error);
    }
  };

  // Load saved timetables on component mount
  useEffect(() => {
    fetchTimetables();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="text-center">📅 Auto-Generated Timetable</h3>

      {/* Add New Subject */}
      <h4 className="mt-4">➕ Add Subjects</h4>
      <div className="d-flex gap-2">
        <Form.Control
          type="text"
          placeholder="Enter Subject"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
        />
        <Form.Control
          type="text"
          placeholder="Enter Faculty Name"
          value={newFaculty}
          onChange={(e) => setNewFaculty(e.target.value)}
        />
        <Form.Select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </Form.Select>
        <Form.Control
          type="number"
          min="1"
          placeholder="Weekly Hours"
          value={newHours}
          onChange={(e) => setNewHours(e.target.value)}
        />
        <Button variant="success" onClick={addSubject}>
          ➕ Add
        </Button>
      </div>

      {/* Display Entered Subjects */}
      {subjects.length > 0 && (
        <>
          <h4 className="mt-4">📋 Subjects List</h4>
          <ul className="list-group">
            {subjects.map((subject, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between">
                {subject.name} ({subject.category}) - {subject.hours} hrs | Faculty: {subject.faculty}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Generate Timetable Button */}
      <Button className="mt-3" onClick={generateTimetable} variant="primary">
        📌 Generate & Save Timetable
      </Button>

      {/* Display Timetable */}
      {schedule && (
        <>
          <h4 className="mt-4">📋 Timetable</h4>
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
              {Object.keys(schedule).map((day, index) => (
                <tr key={index}>
                  <td>{day}</td>
                  {schedule[day].map((subject, idx) => (
                    <td key={idx}>{subject}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {/* Display Saved Timetables */}
      {savedTimetables.length > 0 && (
  <>
    <h4 className="mt-4">📜 Saved Timetables</h4>
    {savedTimetables.map((timetable, index) => (
      <div key={index} className="border p-3 mb-3">
        {/* Check if timestamp exists and is valid */}
        <p>
          📅 Saved on:{" "}
          {timetable.timestamp && timetable.timestamp.seconds
            ? new Date(timetable.timestamp.seconds * 1000).toLocaleString()
            : "Unknown"}
        </p>
        
        {/* Check if timetable.timetable exists and is an object */}
        {timetable.timetable ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Day</th>
                {periods.map((p, idx) => (
                  <th key={idx}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(timetable.timetable).map((day) => (
                <tr key={day}>
                  <td>{day}</td>
                  {timetable.timetable[day].map((subject, idx) => (
                    <td key={idx}>{subject}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No timetable data available.</p> // In case timetable.timetable is null or undefined
        )}
      </div>
    ))}
  </>
)}


    </div>
  );
};

export default AutoTimetable;
