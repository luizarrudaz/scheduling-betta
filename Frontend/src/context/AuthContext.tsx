import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    groups: string[];
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    loading: true,
    groups: []
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<string[]>([]);

    useEffect(() => {
        axios.get("https://localhost:44378/Auth/CheckAuth")
          .then((res) => {
            setIsAuthenticated(res.data.Authenticated);
            setGroups(res.data.Groups);
          })
          .catch(() => {
            setIsAuthenticated(false);
            setGroups([]);
          })
          .finally(() => setLoading(false));
      }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, groups}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);