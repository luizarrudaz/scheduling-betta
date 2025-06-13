export interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    groups: string[];
    sid: string | null;
    logout: () => void;
    refreshAuth: () => Promise<void>;
}