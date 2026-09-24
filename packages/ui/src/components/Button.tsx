import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-cyan-500 hover:bg-cyan-400 text-black font-bold',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-white font-medium',
  outline: 'border border-slate-700 hover:border-slate-500 text-white font-medium',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  return (
    <button className={`px-4 py-2 rounded-md transition ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
