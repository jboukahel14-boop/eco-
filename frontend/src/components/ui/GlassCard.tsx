import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-xl',
        'dark:border-white/10 dark:bg-surface-800/70',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
