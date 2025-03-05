import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import UserCard from "../components/UserCard";
import ChatBox from "../components/ChatBox";
import AllUser from "../components/AllUser";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { chats, onlineUsers } = useContext(ChatContext);

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        {/* Sidebar */}
        <div className="col-md-4 border-end d-flex flex-column h-100">
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
        </div>

        {/* Chat Area */}
        <div className="col-md-8 d-flex flex-column h-100">
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default Chat;
