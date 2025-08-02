import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import API_BASE_URL from "../utils/config";

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  region: string;
  preferredStore: string;
  walkthroughEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (
    name: string,
    email: string,
    password: string,
    region: string,
    preferredStore: string
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      const savedToken = await AsyncStorage.getItem("token");

      if (!savedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      setToken(savedToken);

      try {
        const res = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
        setToken("");
        await AsyncStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password,
      });

      await AsyncStorage.setItem("token", data.token);
      setToken(data.token);

      const res = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      setUser(res.data);
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

  const logout = async () => {
    setToken("");
    setUser(null);
    await AsyncStorage.removeItem("token");
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    region: string,
    preferredStore: string
  ): Promise<boolean> => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/users`, {
        name,
        email,
        password,
        region,
        preferredStore,
      });

      await AsyncStorage.setItem("token", data.token);
      setToken(data.token);

      const res = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      setUser(res.data);
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        "Signup failed:",
        axiosError.response?.data || axiosError.message
      );
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, loading, login, logout, signup }}
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
