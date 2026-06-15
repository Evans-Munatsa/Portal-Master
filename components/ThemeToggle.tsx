'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center opacity-0" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <motion.button
      id="portal-theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-705 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7145FF] focus:ring-offset-2 dark:focus:ring-offset-slate-950 overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      layout
      aria-label="Toggle Dark Mode"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun-icon"
            initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center text-amber-500"
          >
            <Sun className="w-[18px] h-[18px] fill-amber-500/20" />
          </motion.div>
        ) : (
          <motion.div
            key="moon-icon"
            initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center text-[#7145FF]"
          >
            <Moon className="w-[18px] h-[18px] fill-[#7145FF]/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
