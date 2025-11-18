import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from './utils';

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void;
  variant?: 'default' | 'interest' | 'tag' | 'filter';
  selected?: boolean;
}

export function Chip({ 
  children, 
  onRemove, 
  variant = 'default', 
  selected = false,
  className, 
  ...props 
}: ChipProps) {
  const variants = {
    default: selected
      ? 'gradient-bg text-white border-transparent'
      : 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary text-primary',
    interest: selected
      ? 'gradient-bg text-white border-transparent'
      : 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/50 text-foreground',
    tag: selected
      ? 'bg-primary text-white border-transparent'
      : 'bg-primary/10 border-transparent text-primary',
    filter: selected
      ? 'gradient-bg text-white border-transparent shadow-md'
      : 'bg-white border-border text-foreground hover:border-primary',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }} 
          className="hover:opacity-70 transition-opacity ml-1"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}


