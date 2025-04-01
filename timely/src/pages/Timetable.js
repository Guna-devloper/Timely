import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import { Button } from "react-bootstrap";
import { addNotification } from "../utils/notification";

function Timetable() {
  const [timetable, setTimetable] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "timetables"));
        const timetableData = querySnapshot.docs.map((doc) => ({
          id: doc.id, 
          ...doc.data()
        })) || []; 

        setTimetable(timetableData);
      } catch (error) {
        console.error("❌ Error fetching timetable:", error);
        setTimetable([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const deleteTimetableEntry = async (id, slotIndex) => {
    try {
      const docRef = doc(db, "timetables", id);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        let updatedSlots = docSnap.data().slots || [];
        updatedSlots.splice(slotIndex, 1);
  
        if (updatedSlots.length === 0) {
          await deleteDoc(docRef); 
          setTimetable((prev) => prev.filter(entry => entry.id !== id));
        } else {
          await setDoc(docRef, { day: docSnap.data().day, slots: updatedSlots });
          setTimetable((prev) =>
            prev.map(entry => entry.id === id ? { ...entry, slots: updatedSlots } : entry)
          );
        }
  
        await addNotification(`A timetable slot was deleted.`);
      }
    } catch (error) {
      console.error("❌ Error deleting timetable entry:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>📅 Weekly Timetable</h2>

      {loading ? ( 
        <div className="text-center mt-3">
          <Spinner animation="border" variant="primary" />
          <p>Loading timetable...</p>
        </div>
      ) : timetable.length === 0 ? (
        <p className="text-center text-danger">⚠️ No timetable data available.</p> 
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Day</th>
              <th>Time Slot</th>
              <th>Subject</th>
              <th>Faculty</th>
              <th>Room</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {timetable.map((entry) =>
              (entry.slots || []).map((slot, index) => (
                <tr key={`${entry.id}-${index}`}>
                  <td>{entry.day || "N/A"}</td>
                  <td>{slot?.time || "N/A"}</td>
                  <td>{slot?.subject || "N/A"}</td>
                  <td>{slot?.faculty || "N/A"}</td>
                  <td>{slot?.room || "N/A"}</td>
                  <td>
                    <Button variant="danger" onClick={() => deleteTimetableEntry(entry.id, index)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default Timetable;
