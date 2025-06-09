import { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType } from "../components/Types/Context/AuthContextType";
import api from "../services/api";
import axios from "axios";

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  groups: [],
  logout: () => {},
  refreshAuth: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<string[]>([]);

  const checkTokenExists = () => {
    return !!sessionStorage.getItem('jwtToken');
  };

  const refreshAuth = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('jwtToken');

      if (!token) {
        setIsAuthenticated(false);
        setGroups([]);
        return;
      }

      const { data } = await api.get("/auth/check-auth");
      
      setIsAuthenticated(data.authenticated);
      
      const normalizedGroups = (data.groups || []).map((g: string) => g.trim().toUpperCase());
      setGroups(normalizedGroups);
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        sessionStorage.removeItem('jwtToken');
      }
      
      setIsAuthenticated(false);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.removeItem('jwtToken');
      setIsAuthenticated(false);
      setGroups([]);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'jwtToken') {
        refreshAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    refreshAuth();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        loading, 
        groups, 
        logout,
        refreshAuth 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);