import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Card, ListGroup, Badge, Container, Row, Col } from "react-bootstrap";
import { BsBellFill } from "react-icons/bs";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const notificationsQuery = query(
      collection(db, "notifications"),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(notificationsQuery, (snapshot) => {
      setNotifications(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  return (
    <Container className="mt-4">
      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <Card className="shadow-sm">
            <Card.Header className="d-flex align-items-center justify-content-between">
              <h4 className="mb-0">
                <BsBellFill className="text-warning me-2" />
                Notifications
              </h4>
              <Badge bg="primary">{notifications.length}</Badge>
            </Card.Header>

            <ListGroup variant="flush">
              {notifications.length === 0 ? (
                <ListGroup.Item className="text-center text-muted">
                  No new notifications
                </ListGroup.Item>
              ) : (
                notifications.map((notification) => (
                  <ListGroup.Item key={notification.id}>
                    <strong>{notification.title}</strong>
                    <p className="mb-1">{notification.message}</p>
                    <small className="text-muted">
                      {new Date(notification.timestamp?.seconds * 1000).toLocaleString()}
                    </small>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Notifications;
