import React, { useState } from "react";
import ChatBox from "../components/ChatBox";
import AllUsers from "../components/AllUser";
import { Container, Stack } from "react-bootstrap";
import UserCard from "../components/UserCard";

const Chat = () => {
  const [currentChat, setCurrentChat] = useState(null);

  const updateCurrentChat = (chat) => {
    setCurrentChat(chat);
  };

  // Mock Authentication Context
  const mockUser = {
    _id: "user123",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  };

  // Mock Chats Data
  const mockUserChats = [
    {
      _id: "chat1",
      members: [
        {
          _id: "user123",
          name: "John Doe",
          avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        },
        {
          _id: "user456",
          name: "Jane Smith",
          avatar: "https://randomuser.me/api/portraits/women/2.jpg",
        },
      ],
      lastMessage: {
        text: "Hey, how are you?",
        sender: "user456",
        createdAt: new Date(),
      },
    },
    {
      _id: "chat2",
      members: [
        {
          _id: "user123",
          name: "John Doe",
          avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        },
        {
          _id: "user789",
          name: "Mike Johnson",
          avatar: "https://randomuser.me/api/portraits/men/3.jpg",
        },
      ],
      lastMessage: {
        text: "Meeting tomorrow?",
        sender: "user789",
        createdAt: new Date(),
      },
    },
  ];
  return (
    <Container>
      <AllUsers />
      {mockUserChats?.length < 1 ? null : (
        <Stack direction="horizontal" gap={4} className="align-items-start">
          <Stack className="messages-box flex-grow-0 pe-3" gap={3}>
            {/* {isUserChatsLoading && <p>Fetching Chats..</p>} */}
            {/* {(!isUserChatsLoading && !userChats) ||
              (!userChats?.length === 0 && <p>No Chats..</p>)} */}
            {mockUserChats?.map((chat, index) => {
              return (
                <div key={index} onClick={() => updateCurrentChat(chat)}>
                  <UserCard />
                </div>
              );
            })}
          </Stack>
          <ChatBox />
        </Stack>
      )}
    </Container>
  );
};

export default Chat;
