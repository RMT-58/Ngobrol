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

  return (
    <Container
      fluid
      className="vh-100 d-flex flex-column p-0"
      style={{ minHeight: "100vh" }}
    >
      <Row className="g-0 flex-grow-1">
        {/* Sidebar */}
        <Col
          md={4}
          className="border-end d-flex flex-column"
          style={{ height: "100vh", overflow: "hidden" }}
        >
          <div className="p-3 flex-shrink-0">
            <h5 className="mb-3">Your Chats</h5>
          </div>

          <div className="overflow-auto flex-grow-1">
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

          <div className="mt-auto p-3 flex-shrink-0">
            <AllUser />
          </div>
        </Col>

        {/* Chat Area */}
        <Col
          md={8}
          className="d-flex flex-column p-0"
          style={{ height: "100vh" }}
        >
          <ChatBox />
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
