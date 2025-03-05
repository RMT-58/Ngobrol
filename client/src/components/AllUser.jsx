import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const AllUsers = () => {
  const { user } = useContext(AuthContext);
  const { potentialChats, createChat, onlineUsers } = useContext(ChatContext);

  console.log("PotentialChats:", potentialChats);
  console.log("Current user:", user);
  console.log("OnlineUsers:", onlineUsers);

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Available Users</h4>
      {potentialChats && potentialChats.length > 0 ? (
        <div className="row">
          {potentialChats.map((receiver, index) => (
            <div className="col-md-6 col-lg-4 mb-3" key={index}>
              <div
                className="card cursor-pointer"
                onClick={() => createChat(receiver.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body d-flex align-items-center">
                  <div className="flex-grow-1">{receiver.name}</div>
                  {onlineUsers?.some((u) => u?.userId === receiver?.id) && (
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
      ) : (
        <p className="text-center text-muted">
          No new users available to chat with
        </p>
      )}
    </div>
  );
};

export default AllUsers;
