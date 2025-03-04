import { useRef, useState, useEffect } from "react";
import { Stack, Container, Form, Button } from "react-bootstrap";
import InputEmoji from "react-input-emoji";
import moment from "moment";

const ChatBox = () => {
  // Dummy user data
  const currentUser = {
    _id: "user1",
    name: "John Doe",
  };

  // Dummy recipient data
  const recipientUser = {
    _id: "user2",
    name: "Jane Smith",
  };

  // Dummy chat data
  const currentChat = {
    _id: "chat1",
    members: ["user1", "user2"],
  };

  // Dummy messages data
  const [messages, setMessages] = useState([
    {
      _id: "msg1",
      text: "Halo bro?",
      senderId: "user2",
      createdAt: "2025-03-03T10:30:00",
    },
    {
      _id: "msg2",
      text: "aman bro gmn?",
      senderId: "user1",
      createdAt: "2025-03-03T10:32:00",
    },
    {
      _id: "msg3",
      text: "aman lah. ngoding BYASALAH.",
      senderId: "user2",
      createdAt: "2025-03-03T10:35:00",
    },
    {
      _id: "msg4",
      text: "oh gitu?",
      senderId: "user1",
      createdAt: "2025-03-03T10:37:00",
    },
    {
      _id: "msg5",
      text: "chat app bre lelah",
      senderId: "user2",
      createdAt: "2025-03-03T10:40:00",
    },
  ]);

  const [textMessage, setTextMessage] = useState("");
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const scroll = useRef();

  // Auto-scroll to the newest message
  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate sending a message
  const sendTextMessage = (text) => {
    if (text.trim() === "") return;

    const newMessage = {
      _id: `msg${messages.length + 1}`,
      text: text,
      senderId: currentUser._id,
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setTextMessage("");
  };

  // Show loading state
  if (isMessagesLoading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading chat...</p>
        </div>
      </Container>
    );
  }

  // Show placeholder when no chat is selected
  if (!recipientUser) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <p className="text-center text-muted">
          No conversation selected yet...
        </p>
      </Container>
    );
  }

  return (
    <Container className="chat-container p-0">
      <div className="chat-header bg-light p-3 border-bottom">
        <h5 className="mb-0">{recipientUser.name}</h5>
      </div>

      <div
        className="messages-container p-3"
        style={{ height: "60vh", overflowY: "auto" }}
      >
        <Stack gap={3} className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`d-flex ${
                message.senderId === currentUser._id
                  ? "justify-content-end"
                  : "justify-content-start"
              }`}
            >
              <div
                className={`message p-2 rounded-3 ${
                  message.senderId === currentUser._id
                    ? "bg-primary text-white"
                    : "bg-light"
                }`}
                style={{ maxWidth: "75%" }}
                ref={index === messages.length - 1 ? scroll : null}
              >
                <div>{message.text}</div>
                <div
                  className={`message-footer text-end mt-1 ${
                    message.senderId === currentUser._id
                      ? "text-white-50"
                      : "text-muted"
                  }`}
                  style={{ fontSize: "0.75rem" }}
                >
                  {moment(message.createdAt).calendar()}
                </div>
              </div>
            </div>
          ))}
        </Stack>
      </div>

      <div className="chat-input-container p-3 border-top">
        <Stack direction="horizontal" gap={2}>
          <InputEmoji
            value={textMessage}
            onChange={setTextMessage}
            fontFamily="nunito"
            borderColor="rgba(72, 112, 223, 0.2)"
            placeholder="Type a message..."
            onEnter={sendTextMessage}
          />
          <Button
            variant="primary"
            className="send-btn"
            onClick={() => sendTextMessage(textMessage)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-send-fill"
              viewBox="0 0 16 16"
            >
              <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
            </svg>
          </Button>
        </Stack>
      </div>
    </Container>
  );
};

export default ChatBox;
