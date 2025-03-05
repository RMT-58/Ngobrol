import React, { useContext } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import UserCard from "../components/UserCard";
import ChatBox from "../components/ChatBox";
import AllUser from "../components/AllUser";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { chats, onlineUsers } = useContext(ChatContext);

  console.log("Chat component - user:", user);
  console.log("Chat component - chats:", chats);
  console.log("Chat component - onlineUsers:", onlineUsers);

  return (
    <Container fluid className="h-100">
      <Row className="h-100">
        {/* Sidebar */}
        <Col
          md={4}
          className="border-end h-100 overflow-auto"
          style={{ maxHeight: "100vh" }}
        >
          <div className="p-3">
            <h5 className="mb-3">Your Chats</h5>
            {chats && chats.length > 0 ? (
              chats.map((chat) => (
                <UserCard
                  key={chat.id}
                  chat={chat}
                  isOnline={onlineUsers?.some(
                    (u) =>
                      u.userId === chat.members.find((id) => id !== user?.id)
                  )}
                />
              ))
            ) : (
              <p className="text-muted text-center">No chats yet</p>
            )}
          </div>

          <AllUser />
        </Col>

        <Col md={8} className="h-100 d-flex flex-column">
          <ChatBox />
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
