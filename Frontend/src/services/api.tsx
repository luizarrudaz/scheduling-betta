import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:44378",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          sessionStorage.removeItem("jwtToken");
          window.location.href = "/";
          console.error("Sua sessão expirou. Por favor, faça login novamente.", error.config.url);
          break;
        case 403:
          console.error("Você não tem permissão para acessar este recurso.", error.config.url);
          break;
        case 404:
          console.error("Endpoint não encontrado: ", error.config.url);
          break;
        case 500:
          console.error("Erro no servidor: ", error.config.url);
          break;
        default:
          console.error("Erro desconhecido: ", error);
      }
    } else if (error.request) {
      console.error("Sem resposta do servidor: ", error.request);
    } else {
      console.error("Erro na configuração da requisição: ", error.message);
    }

    return Promise.reject(error);
  }
);

window.addEventListener("storage", (event) => {
  if (event.key === "jwtToken") {
    window.location.reload();
  }
});

export default api;