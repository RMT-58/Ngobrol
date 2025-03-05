import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthContextProvider, AuthContext } from "./context/AuthContext";
import { ChatContextProvider } from "./context/ChatContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./App.css";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ChatContextProvider>
                  <Chat />
                </ChatContextProvider>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthContextProvider>
    </BrowserRouter>
  );
};

export default App;
