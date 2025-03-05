import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {
  Card,
  Form,
  Button,
  InputGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FiSend } from "react-icons/fi";
import { GoogleGenerativeAI } from "@google/generative-ai";
import moment from "moment";
import avatar from "../assets/avatar.svg";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SentimentBadge = ({ message }) => {
  const [sentiment, setSentiment] = useState(null);

  const sentimentMap = {
    // Positif
    very_positive: {
      color: "text-success",
      icon: "🎉",
      description: "Sangat Positif",
      category: "Antusias",
    },
    positive: {
      color: "text-success",
      icon: "😊",
      description: "Positif",
      category: "Senang",
    },
    slightly_positive: {
      color: "text-success",
      icon: "🙂",
      description: "Sedikit Positif",
      category: "Optimis",
    },

    // Netral
    neutral: {
      color: "text-secondary",
      icon: "😐",
      description: "Netral",
      category: "Objektif",
    },

    // Negatif
    slightly_negative: {
      color: "text-warning",
      icon: "😕",
      description: "Sedikit Negatif",
      category: "Kurang Senang",
    },
    negative: {
      color: "text-danger",
      icon: "😞",
      description: "Negatif",
      category: "Sedih",
    },
    very_negative: {
      color: "text-danger",
      icon: "😡",
      description: "Sangat Negatif",
      category: "Marah",
    },
  };

  const analyzeSentiment = async (text) => {
    if (!text) return null;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Analyze the sentiment of the following message with high precision. 
      Classify it into one of these categories:
      - very_positive
      - positive
      - slightly_positive
      - neutral
      - slightly_negative
      - negative
      - very_negative

      Provide ONLY the most appropriate classification.
      
      Message: "${text}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const sentimentText = response.text().toLowerCase().trim();

      const validSentiments = Object.keys(sentimentMap);
      const finalSentiment = validSentiments.includes(sentimentText)
        ? sentimentText
        : "neutral";

      setSentiment(finalSentiment);
      return finalSentiment;
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      return null;
    }
  };

  useEffect(() => {
    analyzeSentiment(message);
  }, [message]);

  if (!sentiment) return null;

  const sentimentStyle = sentimentMap[sentiment];

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="sentiment-tooltip">{sentimentStyle.description}</Tooltip>
      }
    >
      <span
        className={`ms-2 ${sentimentStyle.color}`}
        style={{ cursor: "help" }}
      >
        {sentimentStyle.icon}
      </span>
    </OverlayTrigger>
  );
};

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const {
    currentChat,
    messages,
    isLoading,
    sendMessage,
    getMessages,
    aiSuggestion,
    getAiSuggestion,
  } = useContext(ChatContext);
  const [textMessage, setTextMessage] = useState("");
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
    if (textMessage.trim() === "") return;

    sendMessage(textMessage, currentChat.id, recipientId);
    setTextMessage("");
  };

  const formatTimestamp = (timestamp) => {
    return moment(timestamp).calendar();
  };

  //!BUAT AI SUGGESTIONNYA
  const handleAiSuggestionClick = () => {
    // Use user.id instead of user._id to be consistent
    const formattedMessages = messages.map((m) => ({
      role: m.senderId === user.id ? "user" : "assistant",
      content: m.text,
    }));

    // Log the formatted messages to debug
    console.log("Sending messages to AI:", formattedMessages);

    // Call the getAiSuggestion function
    getAiSuggestion(formattedMessages);
  };

  useEffect(() => {
    if (aiSuggestion) {
      setTextMessage(aiSuggestion);
    }
  }, [aiSuggestion]);
  //!BUAT AI SUGGESTIONNYA

  if (!recipientUser)
    return (
      <p style={{ textAlign: "center", width: "100%" }}>
        No conversation selected yet..
      </p>
    );

  if (isLoading)
    return (
      <p style={{ textAlign: "center", width: "100%" }}>Loading chat...</p>
    );

  if (!currentChat) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <p className="text-muted">Select a chat to start messaging</p>
      </div>
    );
  }

  //   return (
  //     <Card className="border-0 shadow-sm h-100 d-flex flex-column">
  //       <Card.Header className="bg-white border-bottom p-3">
  //         <div className="d-flex align-items-center">
  //           <img
  //             src={avatar}
  //             alt="User Avatar"
  //             className="rounded-circle me-3"
  //             style={{ width: "40px", height: "40px", objectFit: "cover" }}
  //           />
  //           <div className="flex-grow-1">
  //             <h5 className="mb-0">{recipientUser.name}</h5>
  //           </div>
  //         </div>
  //       </Card.Header>

  //       <Card.Body
  //         className="p-3 flex-grow-1 overflow-auto"
  //         style={{ maxHeight: "calc(100vh - 280px)" }}
  //       >
  //         {isLoading ? (
  //           <div className="text-center p-4">
  //             <span className="spinner-border spinner-border-sm text-primary me-2"></span>
  //             Loading messages...
  //           </div>
  //         ) : messages.length === 0 ? (
  //           <div className="text-center text-muted p-4">
  //             No messages yet. Start the conversation!
  //           </div>
  //         ) : (
  //           <div className="d-flex flex-column gap-3">
  //             {messages.map((message, index) => (
  //               <div
  //                 key={index}
  //                 className={`d-flex ${
  //                   message.senderId === user?.id
  //                     ? "justify-content-end"
  //                     : "justify-content-start"
  //                 }`}
  //               >
  //                 <div
  //                   className={`message-bubble p-3 rounded-3 position-relative ${
  //                     message.senderId === user?.id
  //                       ? "bg-primary text-white"
  //                       : "bg-light"
  //                   }`}
  //                   style={{ maxWidth: "75%", overflowWrap: "break-word" }}
  //                 >
  //                   <div>{message.text}</div>
  //                   <div
  //                     className={`text-end mt-1 small ${
  //                       message.senderId === user?.id
  //                         ? "text-white-50"
  //                         : "text-muted"
  //                     }`}
  //                   >
  //                     {formatTimestamp(message.createdAt)}
  //                     <SentimentBadge message={message.text} />
  //                   </div>
  //                 </div>
  //               </div>
  //             ))}
  //             <div ref={endOfMessagesRef} />
  //           </div>
  //         )}
  //       </Card.Body>

  //       {/* <button onClick={handleAISuggestionClick}>Get AI Suggestion</button>

  //       {aiSuggestion && (
  //         <div className="ai-suggestion">
  //           <strong>AI Suggestion:</strong> {aiSuggestion}
  //         </div>
  //       )} */}

  //       <Card.Footer className="bg-white border-top p-3">
  //         <Form onSubmit={handleSubmit}>
  //           <InputGroup>
  //             <Form.Control
  //               type="text"
  //               placeholder="Type a message..."
  //               value={textMessage}
  //               onChange={(e) => setTextMessage(e.target.value)}
  //               className="rounded-start"
  //             />
  //             {/* New button to get Gemini suggestion */}
  //             <Button
  //               variant="light"
  //               className="ai-suggestion-btn"
  //               onClick={handleAiSuggestionClick}
  //             >
  //               AI*
  //             </Button>
  //             <Button variant="primary" type="submit" disabled={isLoading}>
  //               <FiSend />
  //             </Button>
  //           </InputGroup>
  //         </Form>
  //       </Card.Footer>
  //     </Card>
  //   );

  return (
    <Card
      className="border-0 shadow-sm h-100 d-flex flex-column"
      style={{ height: "100vh" }}
    >
      <Card.Header className="bg-white border-bottom p-3 flex-shrink-0">
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
        style={{ height: "calc(100vh - 180px)" }}
      >
        {isLoading ? (
          <div className="text-center p-4">
            <span className="spinner-border spinner-border-sm text-primary me-2"></span>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted p-4 h-100 d-flex align-items-center justify-content-center">
            <div>No messages yet. Start the conversation!</div>
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
                  className={`message-bubble p-3 rounded-3 position-relative ${
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
                    <SentimentBadge message={message.text} />
                  </div>
                </div>
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </Card.Body>

      <Card.Footer className="bg-white border-top p-3 flex-shrink-0">
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Type a message..."
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              className="rounded-start"
            />
            {/* New button to get Gemini suggestion */}
            <Button
              variant="light"
              className="ai-suggestion-btn"
              onClick={handleAiSuggestionClick}
            >
              AI*
            </Button>
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
