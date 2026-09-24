import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
}

const styles: Record<NonNullable<BadgeProps['variant']>, string> = {
  info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info' }) => {
  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[variant]}`}>
      {children}
    </span>
  );
};
