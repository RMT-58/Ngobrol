import { useEffect } from "react";
import { createContext, useCallback, useState } from "react";
import axios from "axios";
import { baseUrl } from "../utils/service";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [registerInfo, setRegisterInfo] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  // Token validation on app load
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("User");

      if (token && storedUser) {
        try {
          // Add a token validation endpoint if your backend supports it
          const response = await axios.get(`${baseUrl}/validate-token`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.valid) {
            setUser(JSON.parse(storedUser));
          } else {
            logoutUser();
          }
        } catch (error) {
          console.log(error);
          logoutUser();
        }
      }
    };

    validateToken();
  }, []);

  const updateRegisterInfo = useCallback((info) => {
    setRegisterInfo(info);
  }, []);

  const updateLoginInfo = useCallback((info) => {
    setLoginInfo(info);
  }, []);

  const registerUser = useCallback(
    async (e) => {
      e.preventDefault();

      setIsRegisterLoading(true);
      setRegisterError(null);

      try {
        const response = await axios.post(
          `${baseUrl}/users/register`,
          registerInfo
        );

        localStorage.setItem("User", JSON.stringify(response.data));
        setUser(response.data);
      } catch (error) {
        setRegisterError({
          error: true,
          message: error.response?.data?.message || "Registration failed",
        });
      } finally {
        setIsRegisterLoading(false);
      }
    },
    [registerInfo]
  );

  const loginUser = useCallback(
    async (e) => {
      e.preventDefault();

      setIsLoginLoading(true);
      setLoginError(null);

      try {
        const { data } = await axios.post(`${baseUrl}/login`, loginInfo);

        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("User", JSON.stringify(data));
        setUser(data);
      } catch (error) {
        setLoginError({
          error: true,
          message: error.response?.data?.message || "Login failed",
        });
      } finally {
        setIsLoginLoading(false);
      }
    },
    [loginInfo]
  );

  const logoutUser = useCallback(() => {
    localStorage.removeItem("User");
    localStorage.removeItem("access_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        registerUser,
        loginUser,
        registerInfo,
        updateRegisterInfo,
        loginInfo,
        updateLoginInfo,
        loginError,
        isLoginLoading,
        registerError,
        isRegisterLoading,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
