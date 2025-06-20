import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthContextType } from "../components/Types/Context/AuthContextType";
import api from "../services/api";
import axios from "axios";

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  groups: [],
  sid: null,
  logout: () => {},
  refreshAuth: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<string[]>([]);
  const [sid, setSid] = useState<string | null>(null);
  
  const refreshAuth = useCallback(async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('jwtToken');
      if (!token) {
        setIsAuthenticated(false);
        setGroups([]);
        setSid(null);
        return;
      }
      const { data } = await api.get("/auth/check-auth");
      
      setIsAuthenticated(true);
      setSid(data.sid);
      const normalizedGroups = (data.groups || []).map((g: string) => g.trim().toUpperCase());
      setGroups(normalizedGroups);

    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        sessionStorage.removeItem('jwtToken');
      }
      setIsAuthenticated(false);
      setGroups([]);
      setSid(null);
    } finally {
        setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setGroups([]);
    setSid(null);
  }, []);

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
  }, [refreshAuth]);

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
        sid, 
        logout,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);