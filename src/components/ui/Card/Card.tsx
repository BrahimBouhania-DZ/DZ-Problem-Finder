import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isInteractive?: boolean;
}

function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, isInteractive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card',
          isInteractive && 'card-interactive',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
