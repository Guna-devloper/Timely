import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";

function AdminDashboard() {
  const [timetable, setTimetable] = useState([]);
  const [newEntry, setNewEntry] = useState({ day: "", time: "", subject: "", faculty: "", room: "" });
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");

  useEffect(() => {
    // Real-time updates for timetable
    const unsubscribeTimetable = onSnapshot(collection(db, "timetables"), (snapshot) => {
      setTimetable(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Real-time updates for announcements
    const unsubscribeAnnouncements = onSnapshot(collection(db, "announcements"), (snapshot) => {
      setAnnouncements(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeTimetable();
      unsubscribeAnnouncements();
    };
  }, []);

  // Function to send notifications
  const addNotification = async (message) => {
    await addDoc(collection(db, "notifications"), { message, timestamp: new Date() });
  };

  // Function to add timetable entry
  const addTimetableEntry = async () => {
    if (!newEntry.day || !newEntry.time || !newEntry.subject || !newEntry.faculty || !newEntry.room) {
      alert("Please fill all fields before adding an entry.");
      return;
    }

    try {
      await addDoc(collection(db, "timetables"), {
        day: newEntry.day,
        slots: [{
          time: newEntry.time,
          subject: newEntry.subject,
          faculty: newEntry.faculty,
          room: newEntry.room
        }]
      });

      setNewEntry({ day: "", time: "", subject: "", faculty: "", room: "" });

      // Send notification
      await addNotification(`Timetable updated: ${newEntry.subject} on ${newEntry.day} at ${newEntry.time}`);

    } catch (error) {
      console.error("Error adding timetable entry:", error);
    }
  };

  // Function to delete a timetable entry
  const deleteTimetableEntry = async (id, slotIndex) => {
    const docRef = doc(db, "timetables", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let updatedSlots = docSnap.data().slots || [];

      if (updatedSlots.length > 0) {
        updatedSlots.splice(slotIndex, 1);
      }

      if (updatedSlots.length === 0) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { day: docSnap.data().day, slots: updatedSlots });
      }

      // Send notification
      await addNotification(`A timetable slot was deleted.`);
    } else {
      console.error("Error: Timetable entry not found.");
    }
  };

  // Function to add an announcement
  const addAnnouncement = async () => {
    if (!newAnnouncement.trim()) {
      alert("Please enter an announcement before adding.");
      return;
    }

    try {
      await addDoc(collection(db, "announcements"), {
        message: newAnnouncement,
        timestamp: new Date()
      });

      setNewAnnouncement("");

      // Send notification
      await addNotification(`New Announcement: ${newAnnouncement}`);

    } catch (error) {
      console.error("Error adding announcement:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Manage Timetable</h3>
      <Form>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Day"
            value={newEntry.day}
            onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
          />
          <Form.Control
            type="text"
            placeholder="Time"
            value={newEntry.time}
            onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
          />
          <Form.Control
            type="text"
            placeholder="Subject"
            value={newEntry.subject}
            onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
          />
          <Form.Control
            type="text"
            placeholder="Faculty"
            value={newEntry.faculty}
            onChange={(e) => setNewEntry({ ...newEntry, faculty: e.target.value })}
          />
          <Form.Control
            type="text"
            placeholder="Room"
            value={newEntry.room}
            onChange={(e) => setNewEntry({ ...newEntry, room: e.target.value })}
          />
        </Form.Group>
        <Button onClick={addTimetableEntry} className="mt-2">Add Entry</Button>
      </Form>

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Day</th>
            <th>Time</th>
            <th>Subject</th>
            <th>Faculty</th>
            <th>Room</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {timetable.map((entry) =>
            entry.slots.map((slot, index) => (
              <tr key={`${entry.id}-${index}`}>
                <td>{entry.day}</td>
                <td>{slot.time}</td>
                <td>{slot.subject}</td>
                <td>{slot.faculty}</td>
                <td>{slot.room}</td>
                <td>
                  <Button variant="danger" onClick={() => deleteTimetableEntry(entry.id, index)}>Delete</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <h3 className="mt-4">Announcements</h3>
      <Form.Control
        type="text"
        placeholder="Enter announcement (e.g. 'Project Review - Coming Monday...')"
        value={newAnnouncement}
        onChange={(e) => setNewAnnouncement(e.target.value)}
      />
      <Button className="mt-2" onClick={addAnnouncement}>Add Announcement</Button>

      {announcements.map((announcement) => (
        <Card key={announcement.id} className="mt-3 p-2">
          <strong>{announcement.message}</strong>
        </Card>
      ))}
    </div>
  );
}

export default AdminDashboard;
