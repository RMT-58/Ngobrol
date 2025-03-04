import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Chat from "./pages/Chat";
import Login from "./pages/Login";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<PublicLayout />}> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<h1>Register</h1>} />
        {/* </Route> */}

        {/* <Route path="/" element={<PrivateLayout />}> */}
        <Route path="/" element={<Chat />} />
        {/* </Route> */}

        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
