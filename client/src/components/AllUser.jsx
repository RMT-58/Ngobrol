import { useState } from "react";
// import { AuthContext } from "../../context/AuthContext";
// import { ChatContext } from "../../context/ChatContext";

const AllUsers = () => {
  // Simulating the context data with dummy data
  const [user] = useState({ _id: "user123" });

  // Dummy potential chats data
  const [potentialChats] = useState([
    { _id: "user1", name: "John Doe" },
    { _id: "user2", name: "Jane Smith" },
    { _id: "user3", name: "Alex Johnson" },
    { _id: "user4", name: "Sarah Williams" },
    { _id: "user5", name: "Michael Brown" },
  ]);

  // Dummy online users data
  const [onlineUsers] = useState([{ userId: "user1" }, { userId: "user3" }]);

  // Dummy createChat function
  const createChat = (userId, receiverId) => {
    console.log(`Creating chat between ${userId} and ${receiverId}`);
    // In a real application, this would call the actual createChat function
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Available Users</h4>
      <div className="row">
        {potentialChats &&
          potentialChats.map((receiver, index) => (
            <div className="col-md-6 col-lg-4 mb-3" key={index}>
              <div
                className="card cursor-pointer"
                onClick={() => createChat(user._id, receiver._id)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body d-flex align-items-center">
                  <div className="flex-grow-1">{receiver.name}</div>
                  {onlineUsers?.some(
                    (user) => user?.userId === receiver?._id
                  ) && (
                    <span
                      className="badge bg-success rounded-circle ms-2"
                      style={{ width: "10px", height: "10px" }}
                    ></span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AllUsers;
