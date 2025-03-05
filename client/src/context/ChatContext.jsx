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
import { baseUrl } from "../utils/service";

export const ChatContext = createContext();

//BUAT PROVIDER BUAT NGASIH VALUE KE CHILD COMPONENT
export const ChatContextProvider = ({ children }) => {
  //USER DARI AUTH CONTEXT
  const { user } = useContext(AuthContext);

  //STATE SOCKET, ONLINE USERS, CHATS, CURRENT CHAT, MESSAGES, DLL
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [potentialChats, setPotentialChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [aiSuggestion, setAiSuggestion] = useState("");
  //!AI STUFF GEMINIII
  const getAiSuggestion = useCallback(async (chatMessages) => {
    try {
      const response = await axios.post(
        `${baseUrl}/messages/ai-suggestions`,
        { messages: chatMessages },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setAiSuggestion(response.data.suggestion);
    } catch (error) {
      console.error("Error fetching Gemini suggestion:", error);
      setAiSuggestion("");
    }
  }, []);

  //BUAT NGEBUAT KONEKSI SOCKET BARU pas component mount
  useEffect(() => {
    const newSocket = io(`${baseUrl}`);
    setSocket(newSocket);
    return () => {
      newSocket.disconnect(); //BUAT MATION SOCKET pas component unmount
    };
  }, []);

  //BUAT NGIRIM USER ID KE SOCKET pas user login dan socket udah siap
  useEffect(() => {
    if (socket === null || !user) return;
    socket.emit("addNewUser", user.id);
    socket.on("getUsers", (users) => {
      setOnlineUsers(users); //BUAT SAve DATA USER ONLINE
    });
    return () => {
      socket.off("getUsers"); //HAPUS LISTENER
    };
  }, [socket, user]);

  //BUAT EVENT MESSAGE DAN CHAT BARU DARI SOCKET
  useEffect(() => {
    if (socket === null) return;
    //BUAT NGEHANDLE MESSAGE MASUK
    socket.on("getMessage", (data) => {
      console.log("Received message:", data);
      //BUAT FILTER MESSAGE, kalo bukan dari current user
      if (data.senderId !== user?.id) {
        if (currentChat?.id !== data.chatId) {
          setUnreadMessages((prev) => [...prev, data]);
        } else {
          //show message NYA LANGSUNG kalo chatnya lagi aktif
          setMessages((prev) => [...prev, data]);
          //BUAT UPDATE LAST MESSAGE DI LIST CHAT
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === data.chatId
                ? { ...chat, lastMessage: data.text }
                : chat
            )
          );
        }
      }
    });

    //BUAT NGEHANDLE CHAT BARU DARI SOCKET
    socket.on("newChat", (chat) => {
      console.log("New chat created:", chat);
      setChats((prev) => [...prev, chat]); //BUAT NAMBHAIN CHAT BARU KE STATE
    });

    return () => {
      socket.off("getMessage");
      socket.off("newChat");
    };
  }, [socket, currentChat, user, setMessages, setChats, setUnreadMessages]);

  //UPDATE MESSAGES PAS ADA NEW MESSAGE (KALO MESSAGES DATANG DARI SOURCE LAIN)
  useEffect(() => {
    if (!newMessage) return;
    if (currentChat?._id === newMessage.chatId) {
      setMessages((prev) => [...prev, newMessage]);
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === newMessage.chatId
            ? { ...chat, lastMessage: newMessage.text }
            : chat
        )
      );
    }
  }, [newMessage, currentChat]);

  //BUAT NGAMBIL CHATNYA DARI API
  const getChats = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      console.log("Fetching chats for user:", user);
      const { data } = await axios.get(`${baseUrl}/chats/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("Chats response:", data);
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  //LIST POTENSI CHAT BARU (USER YANG BELUM DI CHATTING)
  const getPotentialChats = useCallback(async () => {
    if (!user) return;
    try {
      console.log("Fetching potential users, current user:", user);
      const response = await axios.get(`${baseUrl}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("All users response:", response.data);
      //BUAT NYARING USER YANG GA SAMA DENGAN LOGGEDIN USER DAN YG BELUM DI CHAT
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

  //BUAT BIKIN CHAT BARU, NGIRIM EVENT KE SOCKET
  const createChat = useCallback(
    (receiverId) => {
      if (!socket || !user) return;
      console.log("Creating chat between", user.id, "and", receiverId);
      socket.emit("createChat", {
        senderId: user.id,
        receiverId,
      });
      //BUAT HANDLE EVENT CHAT CREATED
      const handleChatCreated = (chat) => {
        console.log("Chat created:", chat);
        setChats((prev) => [...prev, chat]);
        setPotentialChats((prev) => prev.filter((u) => u.id !== receiverId));
        socket.off("chatCreated", handleChatCreated);
      };
      //BUAT HANDLE ERROR PAS BIKIN CHAT
      const handleChatError = (error) => {
        console.error("Error creating chat:", error);
        socket.off("chatError", handleChatError);
      };
      socket.on("chatCreated", handleChatCreated);
      socket.on("chatError", handleChatError);
      return () => {
        socket.off("chatCreated", handleChatCreated);
        socket.off("chatError", handleChatError);
      };
    },
    [socket, user]
  );

  //BUAT NGAMBIL MESSAGE DARI API (CHAT DETAIL)
  const getMessages = useCallback(async (chatId) => {
    if (!chatId) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${baseUrl}/messages/${chatId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setMessages(data);
      //BUAT HAPUS UNREAD MESSAGE KALO UDH DIAMBIL
      setUnreadMessages((prev) => prev.filter((msg) => msg.chatId !== chatId));
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  //BUAT NGIRIM MESSAGE KE SOCKET DAN UPDATE STATE MESSAGE DAN CHAT LAST MESSAGE
  const sendMessage = useCallback(
    (text, chatId, receiverId) => {
      if (!socket || !user) return;
      console.log("Sending message:", {
        senderId: user.id,
        recipientId: receiverId,
        chatId,
        text,
      });
      const messageData = {
        chatId,
        senderId: user.id,
        text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, messageData]);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, lastMessage: text } : chat
        )
      );
      socket.emit("sendMessage", {
        senderId: user.id,
        recipientId: receiverId,
        chatId,
        text,
      });
    },
    [socket, user, setMessages, setChats]
  );

  //BUAT UPDATE CHATS, MESSAGES, DLL PAS USER BERUBAH (LOGIN/LOGOUT)
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

  //BUAT NGAMBIL POTENSI CHAT PAS ADA PERUBAHAN DI CHATS
  useEffect(() => {
    getPotentialChats();
  }, [getPotentialChats, chats]);

  //BUAT TANDAIN MESSAGE YANG UDh DIBACA
  const markMessagesAsRead = useCallback((chatId) => {
    setUnreadMessages((prev) => prev.filter((msg) => msg.chatId !== chatId));
  }, []);

  //BUAT NGEMBALIIN UNREAD MESSAGE PER CHAT
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
        aiSuggestion,
        getUnreadMessages,
        setCurrentChat,
        createChat,
        getMessages,
        sendMessage,
        markMessagesAsRead,
        getAiSuggestion,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
