import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { Card, Form, Button, InputGroup } from "react-bootstrap";
import { FiSend } from "react-icons/fi";
import moment from "moment";
import avatar from "../assets/avatar.svg";

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const { currentChat, messages, isLoading, sendMessage, getMessages } =
    useContext(ChatContext);
  const [messageText, setMessageText] = useState("");
  const endOfMessagesRef = useRef(null);

  console.log("ChatBox - currentChat:", currentChat);
  console.log("ChatBox - user:", user);

  const recipientId = currentChat?.members?.find((id) => id !== user?.id);
  console.log("Recipient ID:", recipientId);

  const recipientUser = currentChat?.membersDetails?.find(
    (member) => member?.id === recipientId
  ) || { name: "User" };
  console.log("Recipient user:", recipientUser);

  useEffect(() => {
    if (currentChat?.id) {
      getMessages(currentChat.id);
    }
  }, [currentChat, getMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageText.trim() === "") return;

    sendMessage(messageText, currentChat.id, recipientId);
    setMessageText("");
  };

  const formatTimestamp = (timestamp) => {
    return moment(timestamp).calendar();
  };

  if (!currentChat) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <p className="text-muted">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm h-100 d-flex flex-column">
      <Card.Header className="bg-white border-bottom p-3">
        <div className="d-flex align-items-center">
          <img
            src={avatar}
            alt="User Avatar"
            className="rounded-circle me-3"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
          <div className="flex-grow-1">
            <h5 className="mb-0">{recipientUser.name}</h5>
          </div>
        </div>
      </Card.Header>

      <Card.Body
        className="p-3 flex-grow-1 overflow-auto"
        style={{ maxHeight: "calc(100vh - 280px)" }}
      >
        {isLoading ? (
          <div className="text-center p-4">
            <span className="spinner-border spinner-border-sm text-primary me-2"></span>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted p-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`d-flex ${
                  message.senderId === user?.id
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`message-bubble p-3 rounded-3 ${
                    message.senderId === user?.id
                      ? "bg-primary text-white"
                      : "bg-light"
                  }`}
                  style={{ maxWidth: "75%", overflowWrap: "break-word" }}
                >
                  <div>{message.text}</div>
                  <div
                    className={`text-end mt-1 small ${
                      message.senderId === user?.id
                        ? "text-white-50"
                        : "text-muted"
                    }`}
                  >
                    {formatTimestamp(message.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </Card.Body>

      <Card.Footer className="bg-white border-top p-3">
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="rounded-start"
            />
            <Button variant="primary" type="submit" disabled={isLoading}>
              <FiSend />
            </Button>
          </InputGroup>
        </Form>
      </Card.Footer>
    </Card>
  );
};

export default ChatBox;
