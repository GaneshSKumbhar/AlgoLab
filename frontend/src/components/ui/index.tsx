// Shared UI primitives used across the entire app

import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { clsx } from '../../utils/clsx';

// ── Badge ──────────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'indigo' | 'green' | 'amber' | 'red' | 'gray';
  className?: string;
}
export function Badge({ children, variant = 'indigo', className }: BadgeProps) {
  const variants = {
    indigo: 'badge-indigo',
    green: 'badge-green',
    amber: 'badge-amber',
    red: 'badge-red',
    gray: 'badge bg-surface-700 text-gray-300 border border-surface-600',
  };
  return (
    <span className={clsx(variants[variant], className)}>{children}</span>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}
export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        hover ? 'glass-hover cursor-pointer' : 'glass',
        className
      )}
    >
      {children}
    </div>
  );
}

// ── ComplexityBadge ───────────────────────────────────────────────────────────
const complexityColors: Record<string, string> = {
  'O(1)': 'complexity-excellent',
  'O(log n)': 'complexity-good',
  'O(n)': 'complexity-good',
  'O(n log n)': 'complexity-moderate',
  'O(n²)': 'complexity-poor',
  'O(n³)': 'complexity-bad',
  'O(2^n)': 'complexity-bad',
  'O(n!)': 'complexity-bad',
};

export function ComplexityBadge({ value }: { value: string }) {
  const colorClass =
    Object.entries(complexityColors).find(([k]) => value.includes(k))?.[1] ?? 'text-gray-400';
  return (
    <span className={clsx('font-mono text-sm font-semibold', colorClass)}>
      {value}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={clsx('animate-spin text-primary-400', className)} />;
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}
export function SectionHeader({ title, subtitle, badge, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {badge && <p className="text-primary-400 text-xs font-semibold uppercase tracking-widest mb-1">{badge}</p>}
        <h1 className="section-title">{title}</h1>
        {subtitle && <p className="section-subtitle mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-700 flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-xs">{description}</p>
    </div>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────────
export function MetricCard({ label, value, sub, icon: Icon, color = 'text-primary-400' }: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ElementType;
  color?: string;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-1">
        <span className="metric-label">{label}</span>
        {Icon && <Icon size={16} className={color} />}
      </div>
      <span className={clsx('metric-value', color)}>{value}</span>
      {sub && <span className="text-xs text-gray-500 mt-0.5">{sub}</span>}
    </div>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <ChevronRight size={14} className="text-gray-600" />}
          {item.href ? (
            <a href={item.href} className="hover:text-gray-300 transition-colors">{item.label}</a>
          ) : (
            <span className="text-gray-300">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ElementType }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}
export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={clsx('flex gap-1 bg-surface-800 rounded-lg p-1 border border-surface-600', className)}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
            active === id
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700'
          )}
        >
          {Icon && <Icon size={14} />}
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-10 h-5 rounded-full transition-colors duration-200',
          checked ? 'bg-primary-600' : 'bg-surface-600'
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ type, children }: {
  type: 'info' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
}) {
  const styles = {
    info: 'bg-blue-900/30 border-blue-700/50 text-blue-300',
    warning: 'bg-amber-900/30 border-amber-700/50 text-amber-300',
    error: 'bg-red-900/30 border-red-700/50 text-red-300',
    success: 'bg-emerald-900/30 border-emerald-700/50 text-emerald-300',
  };
  return (
    <div className={clsx('rounded-lg border px-4 py-3 text-sm', styles[type])}>
      {children}
    </div>
  );
}
