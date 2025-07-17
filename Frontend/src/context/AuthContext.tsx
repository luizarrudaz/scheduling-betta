import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { AuthContextType } from "../types/Context/AuthContextType";
import api from "../services/api";

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
  
  const logout = useCallback(() => {
    sessionStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setGroups([]);
    setSid(null);
  }, []);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('jwtToken');
      if (!token) {
        throw new Error("No token found");
      }
      const { data } = await api.get("/auth/check-auth");
      
      setIsAuthenticated(true);
      setSid(data.sid);
      const normalizedGroups = (data.groups || []).map((g: string) => g.trim().toUpperCase());
      setGroups(normalizedGroups);

    } catch (error) {
      logout();
    } finally {
        setLoading(false);
    }
  }, [logout]);

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

  const contextValue = useMemo(() => ({
    isAuthenticated,
    loading,
    groups,
    sid,
    logout,
    refreshAuth
  }), [isAuthenticated, loading, groups, sid, logout, refreshAuth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);