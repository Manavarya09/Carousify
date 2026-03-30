'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = true, onClick }: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white rounded-3xl shadow-soft p-6',
        'transition-all duration-300 ease-out',
        hover && 'hover:shadow-soft-hover cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
