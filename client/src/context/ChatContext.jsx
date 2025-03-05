// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useState,
// } from "react";
// import { io } from "socket.io-client";
// import { AuthContext } from "./AuthContext";
// import axios from "axios";

// export const ChatContext = createContext();

// export const ChatContextProvider = ({ children }) => {
//   const { user } = useContext(AuthContext);
//   const [socket, setSocket] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [chats, setChats] = useState([]);
//   const [currentChat, setCurrentChat] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState(null);
//   const [unreadMessages, setUnreadMessages] = useState([]);
//   const [potentialChats, setPotentialChats] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // Initialize socket connection
//   useEffect(() => {
//     const newSocket = io("http://localhost:3000");
//     setSocket(newSocket);

//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   // Register user with socket when user logs in
//   useEffect(() => {
//     if (socket === null || !user) return;

//     socket.emit("addNewUser", user._id);

//     socket.on("getUsers", (users) => {
//       setOnlineUsers(users);
//     });

//     // Cleanup socket listeners on unmount
//     return () => {
//       socket.off("getUsers");
//     };
//   }, [socket, user]);

//   // Listen for incoming messages
//   useEffect(() => {
//     if (socket === null) return;

//     socket.on("getMessage", (data) => {
//       if (currentChat?._id !== data.chatId) {
//         // Add to unread messages if not in the current chat
//         setUnreadMessages((prev) => [...prev, data]);
//       } else {
//         // Add to current chat messages
//         setNewMessage(data);
//       }
//     });

//     socket.on("newChat", (chat) => {
//       setChats((prev) => [...prev, chat]);
//     });

//     return () => {
//       socket.off("getMessage");
//       socket.off("newChat");
//     };
//   }, [socket, currentChat]);

//   // Add new message to current chat
//   useEffect(() => {
//     if (!newMessage) return;

//     // If the message belongs to the current chat, add it to messages
//     if (currentChat?._id === newMessage.chatId) {
//       setMessages((prev) => [...prev, newMessage]);

//       // Also update the last message in the chats list
//       setChats((prev) =>
//         prev.map((chat) =>
//           chat._id === newMessage.chatId
//             ? { ...chat, lastMessage: newMessage.text }
//             : chat
//         )
//       );
//     }
//   }, [newMessage, currentChat]);

//   // Fetch user chats
//   const getChats = useCallback(async () => {
//     if (!user) return;

//     setIsLoading(true);
//     try {
//       const { data } = await axios.get(
//         `http://localhost:3000/chats/${user._id}`
//       );
//       setChats(data);
//     } catch (error) {
//       console.error("Error fetching chats:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [user]);

//   // Fetch potential users to chat with
//   const getPotentialChats = useCallback(async () => {
//     if (!user) return;

//     try {
//       const { data } = await axios.get("http://localhost:3000/users");
//       // Filter out users already in chat and current user
//       const potentialUsers = data.filter(
//         (u) =>
//           u._id !== user._id &&
//           !chats.some(
//             (chat) =>
//               chat.members.includes(u._id) && chat.members.includes(user._id)
//           )
//       );
//       setPotentialChats(potentialUsers);
//     } catch (error) {
//       console.error("Error fetching potential chats:", error);
//     }
//   }, [user, chats]);

//   // Create a new chat
//   const createChat = useCallback(
//     (receiverId) => {
//       if (!socket || !user) return;

//       socket.emit("createChat", {
//         senderId: user._id,
//         receiverId,
//       });

//       socket.on("chatCreated", (chat) => {
//         setChats((prev) => [...prev, chat]);
//         setPotentialChats((prev) => prev.filter((u) => u._id !== receiverId));
//       });

//       socket.on("chatError", (error) => {
//         console.error("Error creating chat:", error);
//       });

//       return () => {
//         socket.off("chatCreated");
//         socket.off("chatError");
//       };
//     },
//     [socket, user]
//   );

//   // Get chat messages
//   const getMessages = useCallback(async (chatId) => {
//     if (!chatId) return;

//     setIsLoading(true);
//     try {
//       const { data } = await axios.get(
//         `http://localhost:3000/messages/${chatId}`
//       );
//       setMessages(data);

//       // Remove unread messages for this chat
//       setUnreadMessages((prev) => prev.filter((msg) => msg.chatId !== chatId));
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // Send a message
//   const sendMessage = useCallback(
//     (text, chatId, receiverId) => {
//       if (!socket || !user) return;

//       socket.emit("sendMessage", {
//         senderId: user._id,
//         recipientId: receiverId,
//         chatId,
//         text,
//       });
//     },
//     [socket, user]
//   );

//   // Update chats when user changes
//   useEffect(() => {
//     if (user) {
//       getChats();
//     } else {
//       setChats([]);
//       setCurrentChat(null);
//       setMessages([]);
//       setUnreadMessages([]);
//       setPotentialChats([]);
//     }
//   }, [user, getChats]);

//   // Get potential chats when chats change
//   useEffect(() => {
//     getPotentialChats();
//   }, [getPotentialChats, chats]);

//   // Mark messages as read when changing current chat
//   const markMessagesAsRead = useCallback((chatId) => {
//     setUnreadMessages((prev) => prev.filter((msg) => msg.chatId !== chatId));
//   }, []);

//   // Get unread messages for a specific chat
//   const getUnreadMessages = useCallback(
//     (chatId) => {
//       return unreadMessages.filter((msg) => msg.chatId === chatId);
//     },
//     [unreadMessages]
//   );

//   return (
//     <ChatContext.Provider
//       value={{
//         socket,
//         onlineUsers,
//         chats,
//         potentialChats,
//         currentChat,
//         messages,
//         isLoading,
//         unreadMessages,
//         getUnreadMessages,
//         setCurrentChat,
//         createChat,
//         getMessages,
//         sendMessage,
//         markMessagesAsRead,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [potentialChats, setPotentialChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Register user with socket when user logs in
  useEffect(() => {
    if (socket === null || !user) return;

    socket.emit("addNewUser", user.id);

    socket.on("getUsers", (users) => {
      setOnlineUsers(users);
    });

    // Cleanup socket listeners on unmount
    return () => {
      socket.off("getUsers");
    };
  }, [socket, user]);

  // Listen for incoming messages
  useEffect(() => {
    if (socket === null) return;

    socket.on("getMessage", (data) => {
      if (currentChat?._id !== data.chatId) {
        // Add to unread messages if not in the current chat
        setUnreadMessages((prev) => [...prev, data]);
      } else {
        // Add to current chat messages
        setNewMessage(data);
      }
    });

    socket.on("newChat", (chat) => {
      setChats((prev) => [...prev, chat]);
    });

    return () => {
      socket.off("getMessage");
      socket.off("newChat");
    };
  }, [socket, currentChat]);

  // Add new message to current chat
  useEffect(() => {
    if (!newMessage) return;

    // If the message belongs to the current chat, add it to messages
    if (currentChat?._id === newMessage.chatId) {
      setMessages((prev) => [...prev, newMessage]);

      // Also update the last message in the chats list
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === newMessage.chatId
            ? { ...chat, lastMessage: newMessage.text }
            : chat
        )
      );
    }
  }, [newMessage, currentChat]);

  // Fetch user chats
  const getChats = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:3000/chats/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch potential users to chat with

  const getPotentialChats = useCallback(async () => {
    if (!user) return;

    try {
      console.log("Fetching potential users, current user:", user);

      const response = await axios.get("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      console.log("All users response:", response.data);

      // Filter out users already in chat and current user
      const potentialUsers = response.data.filter(
        (u) =>
          u.id !== user.id &&
          !chats.some(
            (chat) =>
              chat.members.includes(u.id) && chat.members.includes(user.id)
          )
      );

      console.log("Filtered potential users:", potentialUsers);
      setPotentialChats(potentialUsers);
    } catch (error) {
      console.error("Error fetching potential chats:", error);
      console.error("Error details:", error.response?.data);
    }
  }, [user, chats]);

  // Create a new chat
  // Create a new chat
  const createChat = useCallback(
    (receiverId) => {
      if (!socket || !user) return;

      console.log("Creating chat between", user.id, "and", receiverId);

      socket.emit("createChat", {
        senderId: user.id,
        receiverId,
      });

      // Set up a one-time event handler for chat creation
      const handleChatCreated = (chat) => {
        console.log("Chat created:", chat);
        setChats((prev) => [...prev, chat]);
        setPotentialChats((prev) => prev.filter((u) => u.id !== receiverId));
        // Remove the event listener after handling
        socket.off("chatCreated", handleChatCreated);
      };

      // Set up a one-time event handler for chat errors
      const handleChatError = (error) => {
        console.error("Error creating chat:", error);
        // Remove the event listener after handling
        socket.off("chatError", handleChatError);
      };

      // Set up event listeners
      socket.on("chatCreated", handleChatCreated);
      socket.on("chatError", handleChatError);

      // Clean up in case the component unmounts
      return () => {
        socket.off("chatCreated", handleChatCreated);
        socket.off("chatError", handleChatError);
      };
    },
    [socket, user]
  );

  // Get chat messages
  const getMessages = useCallback(async (chatId) => {
    if (!chatId) return;

    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:3000/messages/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setMessages(data);

      // Remove unread messages for this chat
      setUnreadMessages((prev) => prev.filter((msg) => msg.chatId !== chatId));
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(
    (text, chatId, receiverId) => {
      if (!socket || !user) return;

      socket.emit("sendMessage", {
        senderId: user._id,
        recipientId: receiverId,
        chatId,
        text,
      });
    },
    [socket, user]
  );

  // Update chats when user changes
  useEffect(() => {
    if (user) {
      getChats();
    } else {
      setChats([]);
      setCurrentChat(null);
      setMessages([]);
      setUnreadMessages([]);
      setPotentialChats([]);
    }
  }, [user, getChats]);

  // Get potential chats when chats change
  useEffect(() => {
    getPotentialChats();
  }, [getPotentialChats, chats]);

  // Mark messages as read when changing current chat
  const markMessagesAsRead = useCallback((chatId) => {
    setUnreadMessages((prev) => prev.filter((msg) => msg.chatId !== chatId));
  }, []);

  // Get unread messages for a specific chat
  const getUnreadMessages = useCallback(
    (chatId) => {
      return unreadMessages.filter((msg) => msg.chatId === chatId);
    },
    [unreadMessages]
  );

  return (
    <ChatContext.Provider
      value={{
        socket,
        onlineUsers,
        chats,
        potentialChats,
        currentChat,
        messages,
        isLoading,
        unreadMessages,
        getUnreadMessages,
        setCurrentChat,
        createChat,
        getMessages,
        sendMessage,
        markMessagesAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
