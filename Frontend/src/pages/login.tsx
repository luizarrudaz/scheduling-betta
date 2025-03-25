import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import bgImage from '../assets/bg-login.webp';
import { useAuth } from '../hooks/Login/UseAuth';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, error, isLoading } = useAuth({
    isProd: false,
    apiEndpoint: 'https://localhost:44378/Auth/Login'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Login</h2>
        {error && (
          <p className="text-red-500 text-center mb-4 bg-red-50 p-2 rounded-lg border border-red-200">
            {error}
          </p>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">Usuário</label>
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
            />
          </div>
          <div className="mb-6 relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">Senha</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full border-b border-gray-300 focus:outline-none focus:border-[#FA7014] text-black py-2 bg-transparent pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Digite sua senha"
              aria-label="Digite sua senha"
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
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;