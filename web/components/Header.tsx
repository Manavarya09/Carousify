'use client';

import { motion } from 'framer-motion';

interface HeaderProps {
  currentView: 'templates' | 'editor';
  onViewChange: (view: 'templates' | 'editor') => void;
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-cream-50/80 backdrop-blur-md border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-lavender-200 to-babyblue-200 rounded-2xl flex items-center justify-center">
              <span className="text-xl font-bold text-lavender-500">C</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Carousify</h1>
              <p className="text-sm text-gray-500">Instagram Grid Carousel Maker</p>
            </div>
          </motion.div>

          <nav className="flex items-center gap-2">
            <motion.button
              onClick={() => onViewChange('templates')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                currentView === 'templates'
                  ? 'bg-lavender-200 text-lavender-500 shadow-soft'
                  : 'text-gray-500 hover:bg-cream-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Templates
            </motion.button>
            <motion.button
              onClick={() => onViewChange('editor')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                currentView === 'editor'
                  ? 'bg-lavender-200 text-lavender-500 shadow-soft'
                  : 'text-gray-500 hover:bg-cream-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Editor
            </motion.button>
          </nav>

          <div className="flex items-center gap-4">
            <motion.button
              className="px-5 py-2.5 bg-babyblue-100 text-gray-700 rounded-xl font-medium hover:bg-babyblue-200 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
