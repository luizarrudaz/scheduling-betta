import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 bg-white/50 dark:bg-black/20 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shadow-soft"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5 text-primary-dark" />
      ) : (
        <SunIcon className="w-5 h-5 text-yellow-400" />
      )}
    </motion.button>
  );
}