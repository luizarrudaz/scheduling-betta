import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:44378",
});

// It need some attention in next features and implementations
//const originalRequest = axios.Axios.prototype.request;

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("jwtToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

window.addEventListener('storage', (event) => {
  if (event.key === 'jwtToken') {
    window.location.reload();
  }
});

export default api;