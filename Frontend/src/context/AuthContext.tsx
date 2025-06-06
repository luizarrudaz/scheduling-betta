import { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType } from "../components/Types/Context/AuthContextType";
import api from "../services/api";

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

  const refreshAuth = async () => {
    setLoading(true);
    try {
      const res = await api.get("/Auth/CheckAuth");
      
      setIsAuthenticated(res.data.authenticated);
      
      const normalizedGroups = (res.data.groups || []).map((g: string) => g.trim().toUpperCase());
      setGroups(normalizedGroups);
      
    } catch {
      setIsAuthenticated(false);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const logout = () => {
    sessionStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setGroups([]);
  };

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