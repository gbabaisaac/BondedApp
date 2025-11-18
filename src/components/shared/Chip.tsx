import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChipProps {
  children: React.ReactNode;
  onRemove?: () => void;
  variant?: 'default' | 'interest' | 'tag' | 'primary';
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({ 
  children, 
  onRemove, 
  variant = 'default',
  className 
}) => {
  const variants = {
    default: 'bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 border-[var(--primary)] text-[var(--primary)]',
    interest: 'bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 border-[var(--primary)] text-[var(--text-primary)]',
    tag: 'bg-[var(--primary)]/10 border-transparent text-[var(--primary)]',
    primary: 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] border-transparent text-white',
  };
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all',
      variants[variant],
      className
    )}>
      {children}
      {onRemove && (
        <button 
          onClick={onRemove} 
          className="hover:opacity-70 transition-opacity"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

