import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const AccessDenied = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full">
            <svg
              className="w-12 h-12 text-[#FA7014]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Acesso Restrito
        </h1>
        
        <p className="text-gray-600 mb-6">
          Você não possui as permissões necessárias para acessar este conteúdo.
        </p>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNavigation}
            className="bg-[#FA7014] text-white px-6 py-3 rounded-lg font-medium
              hover:bg-[#E55F00] transition-colors duration-200 w-full
              flex items-center justify-center gap-2 focus:outline-none focus:ring-2
              focus:ring-[#FA7014] focus:ring-offset-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {window.history.length > 1 ? "Voltar" : "Ir para página inicial"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessDenied;