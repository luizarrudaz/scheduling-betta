import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<null | string>(null);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Substituir pela chamada real à API
        if (email === "admin@example.com" && password === "1234") {
            navigate("/dashboard");
        } else {
            setError("Credenciais inválidas. Tente novamente.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-screen bg-[#FA7014]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all duration-300 hover:scale-105">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Login</h2>
            {error && (
              <p className="text-red-500 text-center mb-4 bg-red-50 p-2 rounded-lg border border-red-200">
                {error}
              </p>
            )}
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#FA7014] focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Digite seu email"
                  aria-label="Digite seu email"
                  style={{ backgroundColor: "whitesmoke" }}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">Senha</label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#FA7014] focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Digite sua senha"
                  aria-label="Digite sua senha"
                  style={{ backgroundColor: "whitesmoke" }}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#FA7014] text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      );
}

export default Login;