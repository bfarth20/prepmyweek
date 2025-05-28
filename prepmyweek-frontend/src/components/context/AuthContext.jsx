import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      axios
        .get(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => setUser(res.data))
        .catch(() => {
          setToken("");
          setUser(null);
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      setToken(data.token);
      return true;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      return false;
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
  };

  const signup = async (name, email, password) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/users`, {
        name,
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      setToken(data.token);
      return true;
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
