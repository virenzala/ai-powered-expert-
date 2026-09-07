import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'valid' | 'invalid' | 'risky' | 'disposable' | 'high' | 'medium' | 'low' | 'info' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'sm' }) => {
  const styles: Record<string, string> = {
    valid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    invalid: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    risky: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    disposable: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    high: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-semibold',
    medium: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    low: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
    info: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    purple: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/30',
    neutral: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-400/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap ${styles[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};
