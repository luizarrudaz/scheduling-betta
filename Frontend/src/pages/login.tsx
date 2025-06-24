import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/Login/UseAuth';
import { useAuthContext } from "../context/AuthContext";
import bgImage from '../assets/bg-login.webp';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login, error, isLoading, } = useAuth({
    isProd: true,
    apiEndpoint: '/auth/login'
  });

  const { isAuthenticated, loading: authLoading } = useAuthContext();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/eventos", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ username, password })
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-cover bg-center relative" style={{ backgroundImage: `url(${bgImage})` }}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FA7014]"></div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all duration-300 hover:scale-105 relative">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Login</h2>

        {error && (
          <p className="text-red-500 text-center mb-4 bg-red-50 p-2 rounded-lg border border-red-200">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">
              Usuário
            </label>
            <input
              type="text"
              id="username"
              className="w-full border-b border-gray-300 focus:outline-none focus:border-[#FA7014] text-black py-2 bg-transparent"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Digite seu nome de usuário"
              aria-label="Digite seu nome de usuário"
              autoComplete="off"
              disabled={isLoading}
            />
          </div>

          <div className="mb-6 relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full border-b border-gray-300 focus:outline-none focus:border-[#FA7014] text-black py-2 bg-transparent pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Digite sua senha"
              aria-label="Digite sua senha"
              disabled={isLoading}
            />
            <span
              className="absolute right-0 top-8 text-black cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>

          <button
            type="submit"
            className={`w-full text-white py-3 rounded-lg font-semibold transition-all duration-300 ${isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-900 transform hover:scale-105 active:scale-95"
              }`}
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;