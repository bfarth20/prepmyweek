"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import type { AxiosError } from "axios";
import API_BASE_URL from "@/lib/config";

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      setToken(data.token);
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        "Login failed:",
        axiosError.response?.data || axiosError.message
      );
      return false;
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/users`, {
        name,
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      setToken(data.token);
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        "Login failed:",
        axiosError.response?.data || axiosError.message
      );
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
