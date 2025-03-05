import { createContext, useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { baseUrl } from "../utils/service";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUserChats] = useState(null);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
  const [userChatsError, setUserChatsError] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState(null);
  const [messagesError, setMessagesError] = useState(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(null);
  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [newMessage, setNewMessage] = useState(null);
  const [potentialChats, setPotentialChats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  console.log("userChats", userChats);
  console.log("currentChat", currentChat);
  console.log("messages", messages);
  console.log("messagesError", messagesError);
  console.log("onlineUsers", onlineUsers);
  console.log("sendTextMessageError", sendTextMessageError);
  console.log("notifications", notifications);

  //init socket
  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  //set users online
  useEffect(() => {
    if (socket === null) return;
    socket.emit("addNewUser", user?.id);
    socket.on("getUsers", (res) => {
      setOnlineUsers(res);
    });

    return () => {
      socket.off("getUsers");
    };
  }, [socket]);

  //send messsage
  useEffect(() => {
    if (socket === null) return;

    const recipientId = currentChat?.members.find((id) => id !== user?.id);

    socket.emit("sendMessage", { ...newMessage, recipientId });
  }, [newMessage]);

  useEffect(() => {
    if (socket === null) return;

    socket.on("getMessage", (res) => {
      if (currentChat?.id !== res.chatId) return;

      setMessages((prev) => [...prev, res]);
    });

    socket.on("getNotification", (res) => {
      const isChatOpen = currentChat?.members.some((id) => id === res.senderId);

      if (isChatOpen) {
        setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
      } else {
        setNotifications((prev) => [res, ...prev]);
      }
    });

    return () => {
      socket.off("getMessage");
      socket.off("getNotification");
    };
  }, [socket, currentChat]);

  useEffect(() => {
    const getMessage = async () => {
      setIsMessagesLoading(true);
      try {
        const response = await axios.get(
          `${baseUrl}/messages/${currentChat?.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        if (response.status === 200) {
          setMessages(response.data);
        } else {
          setMessagesError(response.data.message || "An error occurred");
        }
      } catch (error) {
        setMessagesError(
          error.response?.data?.message || "Failed to fetch messages"
        );
      } finally {
        setIsMessagesLoading(false);
      }
    };

    getMessage();
  }, [currentChat]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        setAllUsers(response.data);

        if (userChats) {
          const pChats = response.data.filter((u) => {
            if (user._id === u._id) return false;

            const isChatCreated = userChats?.some(
              (chat) => chat.members[0] === u._id || chat.members[1] === u._id
            );

            return !isChatCreated;
          });

          setPotentialChats(pChats);
        }
      } catch (error) {
        console.error(
          "Error fetching users:",
          error.response?.data?.message || error.message || error
        );
      }
    };

    getUsers();
  }, [userChats]);

  useEffect(() => {
    const getUserChats = async () => {
      setIsUserChatsLoading(true);
      setUserChatsError(null);

      if (user?._id) {
        const userId = user?._id;

        const response = await axios.get(`${baseUrl}/chats/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (response.error) {
          return setUserChatsError(response);
        }

        setUserChats(response);
      }

      setIsUserChatsLoading(false);
    };

    getUserChats();
  }, [user, notifications]);

  const updateCurrentChat = useCallback(async (chat) => {
    setCurrentChat(chat);
  }, []);

  const sendTextMessage = useCallback(
    async (textMessage, sender, currentChatId, setTextMessage) => {
      if (!textMessage) return console.log("You must type something...");

      const response = await axios.post(
        `${baseUrl}/messages`,
        {
          chatId: currentChatId,
          senderId: sender._id,
          text: textMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.error) {
        return setSendTextMessageError(response);
      }

      setNewMessage(response);
      setMessages((prev) => [...prev, response]);
      setTextMessage("");
    },
    []
  );

  const createChat = useCallback(async (senderId, receiverId) => {
    const response = await axios.post(
      `${baseUrl}/chats`,
      {
        senderId,
        receiverId,
      },
      {}
    );

    if (response.error) {
      return console.log("Error creating chat:", response);
    }

    setUserChats((prev) => [...prev, response]);
  }, []);

  const markAllNotificationsAsRead = useCallback((notifications) => {
    const modifiedNotifications = notifications.map((n) => {
      return { ...n, isRead: true };
    });

    setNotifications(modifiedNotifications);
  }, []);

  const markNotificationAsRead = useCallback(
    (n, userChats, user, notifications) => {
      // find chat to open
      const readChat = userChats.find((chat) => {
        const chatMembers = [user._id, n.senderId];
        const isDesiredChat = chat?.members.every((member) => {
          return chatMembers.includes(member);
        });

        return isDesiredChat;
      });

      // mark notification as read
      const modifiedNotifications = notifications.map((element) => {
        if (n.senderId === element.senderId) {
          return { ...n, isRead: true };
        } else {
          return element;
        }
      });

      updateCurrentChat(readChat);
      setNotifications(modifiedNotifications);
    },
    []
  );

  const markThisUserNotificationsAsRead = useCallback(
    (thisUserNotifications, notifications) => {
      // mark notification as read

      const modifiedNotifications = notifications.map((element) => {
        let notification;

        thisUserNotifications.forEach((n) => {
          if (n.senderId === element.senderId) {
            notification = { ...n, isRead: true };
          } else {
            notification = element;
          }
        });

        return notification;
      });

      setNotifications(modifiedNotifications);
    },
    []
  );
  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        updateCurrentChat,
        currentChat,
        messages,
        messagesError,
        socket,
        sendTextMessage,
        onlineUsers,
        potentialChats,
        createChat,
        notifications,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        markThisUserNotificationsAsRead,
        newMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
