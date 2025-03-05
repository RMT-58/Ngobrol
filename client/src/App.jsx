import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Chat from "./pages/Chat";
import { ChatContextProvider } from "./context/ChatContext";

const App = () => {
  // const { user } = useContext(AuthContext);
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<PublicLayout />}> */}
        <Route path="/login" element={<h1>Login</h1>} />
        <Route path="/register" element={<h1>Register</h1>} />
        {/* </Route> */}

        {/* <Route path="/" element={<PrivateLayout />}> */}
        <Route
          path="/"
          element={
            <ChatContextProvider>
              <Chat />
            </ChatContextProvider>
          }
        />
        {/* </Route> */}

        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
