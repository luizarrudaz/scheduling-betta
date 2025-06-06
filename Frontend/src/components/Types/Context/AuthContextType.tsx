export interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    groups: string[];
    logout: () => void;
    refreshAuth: () => Promise<void>;
}