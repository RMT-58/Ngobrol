import React, { useContext } from "react";
import { Card, Stack, Badge } from "react-bootstrap";
import moment from "moment";
import avatar from "../assets/avatar.svg";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";

const UserCard = ({ chat, isOnline }) => {
  const { user } = useContext(AuthContext);
  const { getUnreadMessages, setCurrentChat, markMessagesAsRead } =
    useContext(ChatContext);

  const recipientId = chat.members.find((id) => id !== user?._id);

  const recipientUser = chat.recipientUser || { username: "User" };

  const unreadMessages = getUnreadMessages(chat._id);

  const handleCardClick = () => {
    setCurrentChat(chat);
    markMessagesAsRead(chat._id);
  };

  return (
    <Card
      className="mb-2 shadow-sm border-0 user-card"
      role="button"
      onClick={handleCardClick}
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
              <div className="fw-bold text-dark">
                {recipientUser.username}
                {isOnline && (
                  <span
                    className="badge bg-success rounded-circle ms-2"
                    style={{ width: "8px", height: "8px" }}
                  ></span>
                )}
              </div>
              <small className="text-muted">
                {chat.lastMessage || "No messages yet"}
              </small>
            </div>
          </div>
          <div className="ms-auto text-end">
            <div className="text-muted small mb-1">
              {chat.updatedAt
                ? moment(chat.updatedAt).calendar()
                : moment().calendar()}
            </div>
            {unreadMessages.length > 0 && (
              <Badge bg="primary" pill className="notification-badge">
                {unreadMessages.length}
              </Badge>
            )}
          </div>
        </Stack>
      </Card.Body>
    </Card>
  );
};

export default UserCard;
