import React, { useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { AuthContext } from "../auth/AuthContext";
import { Card, Row, Col, Button, Spinner, Form, Modal } from "react-bootstrap";

function Dashboard() {
  const { role, user } = useContext(AuthContext);
  const [totalClasses, setTotalClasses] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [facultyMessages, setFacultyMessages] = useState([]);
  const [allFacultyMessages, setAllFacultyMessages] = useState([]);
  const [upcomingClass, setUpcomingClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [showFacultyMessagesModal, setShowFacultyMessagesModal] = useState(false);

  // Admin State for New Announcement
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Timetable Data
        const timetableSnapshot = await getDocs(collection(db, "timetables"));
        const timetableData = timetableSnapshot.docs.map((doc) => doc.data());
        setTotalClasses(timetableData.length);

        // Fetch Latest Announcement
        const announcementsQuery = query(
          collection(db, "announcements"),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const announcementsSnapshot = await getDocs(announcementsQuery);
        setAnnouncements(announcementsSnapshot.docs.map((doc) => doc.data()));

        // Fetch Latest Faculty Message
        const facultyMessagesQuery = query(
          collection(db, "faculty_messages"),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const facultyMessagesSnapshot = await getDocs(facultyMessagesQuery);
        setFacultyMessages(facultyMessagesSnapshot.docs.map((doc) => doc.data()));

        // Fetch Upcoming Class
        if (timetableData.length > 0) {
          const now = new Date();
          const upcoming = timetableData
            .flatMap((entry) => entry.slots || [])
            .find((slot) => new Date(slot.time) > now);
          setUpcomingClass(upcoming || null);
        }
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to fetch all announcements
  const fetchAllAnnouncements = async () => {
    try {
      const allAnnouncementsQuery = query(
        collection(db, "announcements"),
        orderBy("timestamp", "desc")
      );
      const allAnnouncementsSnapshot = await getDocs(allAnnouncementsQuery);
      setAllAnnouncements(allAnnouncementsSnapshot.docs.map((doc) => doc.data()));
      setShowAnnouncementsModal(true);
    } catch (error) {
      console.error("❌ Error fetching all announcements:", error);
    }
  };

  // Function to fetch all faculty messages
  const fetchAllFacultyMessages = async () => {
    try {
      const allFacultyMessagesQuery = query(
        collection(db, "faculty_messages"),
        orderBy("timestamp", "desc")
      );
      const allFacultyMessagesSnapshot = await getDocs(allFacultyMessagesQuery);
      setAllFacultyMessages(allFacultyMessagesSnapshot.docs.map((doc) => doc.data()));
      setShowFacultyMessagesModal(true);
    } catch (error) {
      console.error("❌ Error fetching all faculty messages:", error);
    }
  };

  // Function to Post a New Announcement (Admin Only)
  const handlePostAnnouncement = async () => {
    if (!announcementTitle || !announcementMessage) {
      alert("Please fill in both the title and message.");
      return;
    }

    setPosting(true);
    try {
      await addDoc(collection(db, "announcements"), {
        title: announcementTitle,
        message: announcementMessage,
        postedBy: user?.displayName || "Admin",
        timestamp: Timestamp.now(),
      });

      // Fetch the latest announcement after posting
      const announcementsQuery = query(
        collection(db, "announcements"),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      setAnnouncements(announcementsSnapshot.docs.map((doc) => doc.data()));

      // Reset input fields
      setAnnouncementTitle("");
      setAnnouncementMessage("");
    } catch (error) {
      console.error("❌ Error posting announcement:", error);
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center">📌 Timely Dashboard</h2>

      {/* 🔹 Dashboard Overview */}
      <Row className="mt-4">
        <Col md={4}>
          <Card className="shadow-sm text-center p-3">
            <h4>📅 Total Classes</h4>
            <p className="fs-3 fw-bold">{totalClasses}</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm text-center p-3">
            <h4>📢 Announcements</h4>
            {announcements.length > 0 ? (
              <>
                <p className="text-danger fw-bold">{announcements[0].title}</p>
                <small>By: {announcements[0].postedBy}</small>
                <Button variant="outline-danger" size="sm" onClick={fetchAllAnnouncements}>
                  View All
                </Button>
              </>
            ) : (
              <p className="text-muted">No new announcements</p>
            )}
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm text-center p-3">
            <h4>📩 Faculty Messages</h4>
            {facultyMessages.length > 0 ? (
              <>
                <p className="fw-bold">{facultyMessages[0].message}</p>
                <Button variant="outline-primary" size="sm" onClick={fetchAllFacultyMessages}>
                  View All
                </Button>
              </>
            ) : (
              <p className="text-muted">No new faculty messages</p>
            )}
          </Card>
        </Col>
      </Row>

      {/* 🔹 Announcements Modal */}
      <Modal show={showAnnouncementsModal} onHide={() => setShowAnnouncementsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📢 All Announcements</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {allAnnouncements.map((announcement, index) => (
            <div key={index}>
              <h5>{announcement.title}</h5>
              <p>{announcement.message}</p>
              <hr />
            </div>
          ))}
        </Modal.Body>
      </Modal>

      {/* 🔹 Faculty Messages Modal */}
      <Modal show={showFacultyMessagesModal} onHide={() => setShowFacultyMessagesModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📩 All Faculty Messages</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {allFacultyMessages.map((message, index) => (
            <div key={index}>
              <p><strong>{message.facultyName}:</strong> {message.message}</p>
              <hr />
            </div>
          ))}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Dashboard;
