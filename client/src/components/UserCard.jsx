import React from "react";
import { Card, Stack, Badge } from "react-bootstrap";
import moment from "moment";
import avatar from "../assets/avatar.svg";

const UserCard = () => {
  // Dummy recipient user
  const recipientUser = {
    _id: "user123",
    name: "John Doe",
  };

  // Dummy unread notifications
  const unreadNotifications = [
    { id: 1, senderId: "user123", text: "Hello!", createdAt: new Date() },
    { id: 2, senderId: "user123", text: "How are you?", createdAt: new Date() },
    { id: 3, senderId: "user456", text: "Hey!", createdAt: new Date() },
  ];

  // Filter notifikasi yang berasal dari recipientUser
  const thisUserNotifications = unreadNotifications.filter(
    (n) => n.senderId === recipientUser._id
  );

  return (
    <Card
      className="mb-2 shadow-sm border-0 user-card"
      role="button"
      onClick={() => console.log("Mark notifications as read")}
    >
      <Card.Body className="p-3">
        <Stack direction="horizontal" gap={3} className="align-items-center">
          <div className="d-flex align-items-center">
            <img
              src={avatar}
              alt="User Avatar"
              className="rounded-circle me-3"
              style={{ width: "40px", height: "40px", objectFit: "cover" }}
            />
            <div>
              <div className="fw-bold text-dark">{recipientUser.name}</div>
              <small className="text-muted">
                {thisUserNotifications.length > 0
                  ? thisUserNotifications[0].text
                  : "No new messages"}
              </small>
            </div>
          </div>
          <div className="ms-auto text-end">
            <div className="text-muted small mb-1">{moment().calendar()}</div>
            {thisUserNotifications.length > 0 && (
              <Badge bg="primary" pill className="notification-badge">
                {thisUserNotifications.length}
              </Badge>
            )}
          </div>
        </Stack>
      </Card.Body>
    </Card>
  );
};

export default UserCard;
