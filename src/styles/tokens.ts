export const tokens = {
  color: {
    primary: 'var(--color-primary)',
    surface: 'var(--color-surface)',
    text: 'var(--color-text)',
    muted: 'var(--color-muted)',
    border: 'var(--color-border)',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  font: {
    sans: 'var(--font-sans)',
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
  },
  shadow: {
    card: '0 1px 3px rgb(15 23 42 / 0.08)',
    raised: '0 8px 24px rgb(15 23 42 / 0.12)',
  },
  motion: {
    fast: '150ms',
    base: '250ms',
    slow: '400ms',
  },
} as const
