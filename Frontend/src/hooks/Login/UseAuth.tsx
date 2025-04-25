import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

type AuthConfig = {
  isProd: boolean;
  apiEndpoint?: string;
};

export const useAuth = ({ isProd, apiEndpoint }: AuthConfig) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshAuth } = useAuthContext();

  const login = useCallback(
    async (username: string, password: string) => {
      setError(null);
      setIsLoading(true);

      try {
        if (!isProd) {
          if (username === "luiz.arruda" && password === "1234") {
            navigate("/agendamentos");
            return true;
          } else if (username === "admin" && password === "1234") {
            navigate("/eventos");
            return true;
          }
          throw new Error("Credenciais inválidas");
        }

        if (!apiEndpoint) {
          throw new Error("Endpoint de API não configurado");
        }

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Erro ${response.status}`);
        }

        const { token } = await response.json();
        sessionStorage.setItem('jwtToken', token);

        await refreshAuth();
        navigate("/agendamentos");

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isProd, apiEndpoint, navigate, refreshAuth]

  );

  return { login, error, isLoading };
};