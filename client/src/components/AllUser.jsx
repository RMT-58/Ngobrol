import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const AllUsers = () => {
  const { user } = useContext(AuthContext);
  const { potentialChats, createChat, onlineUsers } = useContext(ChatContext);

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Available Users</h4>
      {potentialChats.length > 0 ? (
        <div className="row">
          {potentialChats.map((receiver, index) => (
            <div className="col-md-6 col-lg-4 mb-3" key={index}>
              <div
                className="card cursor-pointer"
                onClick={() => createChat(receiver._id)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body d-flex align-items-center">
                  <div className="flex-grow-1">{receiver.username}</div>
                  {onlineUsers?.some((u) => u?.userId === receiver?._id) && (
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
