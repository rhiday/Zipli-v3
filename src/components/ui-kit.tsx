/**
 * UI Kit
 * A collection of reusable UI components for the application
 */
import React from 'react';

export interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`rounded-lg bg-white p-6 shadow ${className}`}>
      {title && <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>}
      {children}
    </div>
  );
};

export interface BadgeProps {
  label: string;
  variant?: 'success' | 'info' | 'warning' | 'error' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'default',
  className = '' 
}) => {
  const variantStyles = {
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {label}
    </span>
  );
};

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md',
  className = '' 
}) => {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-green-700 ${sizeStyles[size]} ${className}`}></div>
  );
};