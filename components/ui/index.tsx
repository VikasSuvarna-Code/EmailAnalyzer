'use client';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon, trend, trendUp, className = '' }: StatCardProps) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  className?: string;
}

const badgeVariants: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const btnVariants: Record<string, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300',
  outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200',
};

const btnSizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export function Input({ label, error, helpText, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}{props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-60 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {helpText && !error && <p className="text-xs text-gray-500 dark:text-gray-400">{helpText}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}{props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-500' : ''} ${className}`}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ value, color = 'bg-indigo-500', className = '', showLabel, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1 text-xs text-gray-600 dark:text-gray-400">
          {label && <span>{label}</span>}
          {showLabel && <span>{clamped}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="mb-4 text-gray-300 dark:text-gray-600">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      {description && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const modalSizes: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-full ${modalSizes[size]} bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const areaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={areaId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}{props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={areaId}
        {...props}
        className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${error ? 'border-red-500' : ''} ${className}`}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
