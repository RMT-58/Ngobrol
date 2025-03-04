import { useEffect, useState } from "react";
import ChatBox from "../components/ChatBox";
import AllUsers from "../components/AllUser";
import io from "socket.io-client";
const socket = io("http://localhost:3000");

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("/messages/chat");

    socket.on("/messages/chat", (data) => {
      // console.log(data, "<<< dari server");
      setMessages(data);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("/messages/chat/create", { message, sender: "Deka" });
    setMessage("");
  };

  return (
    <div>
      {/* <AllUsers />
      <ChatBox /> */}
      <ul id="messages">
        {messages.map((message, index) => (
          <li key={index}>
            {message.sender}:{message.message}
          </li>
        ))}
      </ul>
      <form id="form" onSubmit={handleSubmit}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          id="input"
          autocomplete="off"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
