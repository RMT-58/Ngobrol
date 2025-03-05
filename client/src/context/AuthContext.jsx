import { createContext, useCallback, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");

    if (token) {
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const userData = JSON.parse(atob(token.split(".")[1]));
        const { data } = await axios.get(
          `http://localhost:3000/users/find/${userData.id}`
        );
        setUser(data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        localStorage.removeItem("access_token");
      }
    }

    setLoading(false);
  }, []);

  // REGISTERRRR
  const register = async (username, email, password) => {
    try {
      const { data } = await axios.post(
        "http://localhost:3000/users/register",
        {
          name: username,
          email,
          password,
        }
      );

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  //Login
  const login = async (email, password) => {
    try {
      console.log("Attempting login with:", { email });

      const response = await axios.post(
        "http://localhost:3000/users/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("Login response:", response);

      localStorage.setItem("access_token", response.data.access_token);
      await fetchCurrentUser();

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response?.data);

      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  //Logout
  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    axios.defaults.headers.common["Authorization"] = "";
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
