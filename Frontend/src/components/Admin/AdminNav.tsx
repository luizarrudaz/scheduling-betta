import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const adminRoutes = [
  { name: 'Agendar', path: '/agendamentos'},
  { name: 'Gerenciar Eventos', path: '/eventos' },
  { name: 'Agendamentos', path: '/agendamentos-admin' },
  { name: 'Histórico', path: '/'}
];

export default function AdminNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -10 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="absolute top-4 left-4 z-50">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-700 bg-white shadow-md hover:bg-gray-100 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir menu de administração"
      >
        {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-14 left-0 w-64 bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden"
          >
            <ul className="py-2">
              {adminRoutes.map((route) => (
                <motion.li key={route.path} variants={itemVariants}>
                  <Link
                    to={route.path}
                    onClick={() => setIsOpen(false)}
                    className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      location.pathname === route.path
                        ? 'bg-orange-50 text-[#FA7014]'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-[#FA7014]'
                    }`}
                  >
                    {route.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}