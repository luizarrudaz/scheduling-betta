import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { AuthConfig } from "../../components/Types/Login/AuthConfig";
import { Credentials } from "../../components/Types/Login/Credentials";
import api from "../../services/api";

export const useAuth = ({ isProd, apiEndpoint }: AuthConfig) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshAuth } = useAuthContext();

  const login = useCallback(
    async (credentials: Credentials) => {
      setError(null);
      setIsLoading(true);

      try {
        if (!isProd) {
          if (credentials.username === "luiz.arruda" && credentials.password === "1234") {
            sessionStorage.setItem('jwtToken', 'dev-mock-token');
            await refreshAuth();
            return true;
          } else if (credentials.username === "admin" && credentials.password === "1234") {
            sessionStorage.setItem('jwtToken', 'dev-mock-admin-token');
            await refreshAuth();
            return true;
          }
          throw new Error("Credenciais inválidas");
        }

        if (!apiEndpoint) {
          throw new Error("Endpoint de API não configurado");
        }

        const response = await api.post(apiEndpoint.replace(api.defaults.baseURL || '', ''), credentials);

        if (!response.data.token) {
          throw new Error("Token não recebido na resposta");
        }

        sessionStorage.setItem('jwtToken', response.data.token);

        await refreshAuth();
        return true;
      } catch (err: any) {
        let errorMessage = "Erro desconhecido";

        if (err.response) {
          errorMessage = err.response.data?.message || `Erro ${err.response.status}`;
        } else if (err.request) {
          errorMessage = "Sem resposta do servidor";
        } else {
          errorMessage = err.message || errorMessage;
        }

        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isProd, apiEndpoint, refreshAuth]
  );

  return { login, error, isLoading };
};