import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const AutoTimetable = () => {
  const [subjects, setSubjects] = useState([
    { name: "Tamil", hours: 5 },
    { name: "English", hours: 5 },
    { name: "Maths", hours: 6 },
    { name: "C++", hours: 6 },
    { name: "C++ Lab", hours: 4 },
    { name: "Web Designing", hours: 4 },
  ]);

  const [schedule, setSchedule] = useState([]);

  const periods = [
    "9:00 - 9:55",
    "9:55 - 10:50",
    "11:15 - 12:05",
    "12:05 - 1:00",
    "2:00 - 3:00",
    "3:00 - 4:00",
  ];

  const generateTimetable = () => {
    let weeklySchedule = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
    let subjectHours = [...subjects]; // Copy subject hours

    // Distribute subjects into timetable
    Object.keys(weeklySchedule).forEach((day) => {
      periods.forEach((_, periodIndex) => {
        if (subjectHours.length === 0) return;

        let subjectIndex = subjectHours.findIndex((s) => s.hours > 0);
        if (subjectIndex !== -1) {
          weeklySchedule[day].push(subjectHours[subjectIndex].name);
          subjectHours[subjectIndex].hours -= 1;

          // Remove subject if fully allocated
          if (subjectHours[subjectIndex].hours === 0) {
            subjectHours.splice(subjectIndex, 1);
          }
        }
      });
    });

    setSchedule(weeklySchedule);
  };

  useEffect(() => {
    generateTimetable();
  }, [subjects]);

  return (
    <div className="container mt-4">
      <h3>Auto-Generated Timetable</h3>

      <Table striped bordered hover className="mt-4">
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

      <h4 className="mt-4">Customize Subjects</h4>
      {subjects.map((subject, index) => (
        <Form.Group key={index} className="mb-2">
          <Form.Label>{subject.name}</Form.Label>
          <Form.Control
            type="number"
            value={subject.hours}
            onChange={(e) => {
              let updatedSubjects = [...subjects];
              updatedSubjects[index].hours = parseInt(e.target.value);
              setSubjects(updatedSubjects);
            }}
          />
        </Form.Group>
      ))}

      <Button className="mt-2" onClick={generateTimetable}>
        Generate Timetable
      </Button>
    </div>
  );
};

export default AutoTimetable;
