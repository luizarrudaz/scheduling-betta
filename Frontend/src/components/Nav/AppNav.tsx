import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../../context/AuthContext';

const baseRoutes = [
  { name: 'Agendar', path: '/eventos'},
  { name: 'Meus Agendamentos', path: '/agendamentos' },
];

const adminRoutes = [
  { name: 'Gerenciar Eventos', path: '/eventos-admin' },
  { name: 'Gerenciar Agendamentos', path: '/agendamentos-admin' },
  { name: 'Histórico', path: '/historico-admin'}
];

export default function AppNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { groups } = useAuthContext();
  const isAdmin = groups.some(g => g.toUpperCase() === 'RH');
  
  const navRef = useRef<HTMLDivElement>(null);

  const navRoutes = isAdmin ? [...baseRoutes, ...adminRoutes] : baseRoutes;

  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -10 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="absolute top-4 left-4 z-50" ref={navRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-700 bg-white shadow-md hover:bg-gray-100 transition-colors focus:outline-none"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir menu de navegação"
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
              {navRoutes.map((route) => (
                <motion.li key={route.path} variants={itemVariants}>
                  <Link
                    to={route.path}
                    onClick={() => setIsOpen(false)}
                    className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none ${
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