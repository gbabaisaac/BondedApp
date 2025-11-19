/**
 * Logger Utility
 * Centralized logging with environment-aware levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_ENV === 'development';
const isProduction = import.meta.env.PROD || import.meta.env.VITE_ENV === 'production';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isProduction) {
      // In production, only log warnings and errors
      return level === 'warn' || level === 'error';
    }
    // In development, log everything
    return true;
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
    
    // In production, send errors to Sentry
    if (isProduction && typeof window !== 'undefined' && (window as any).Sentry) {
      try {
        (window as any).Sentry.captureException(new Error(String(args[0])));
      } catch (e) {
        // Silently fail if Sentry is not available
      }
    }
  }

  // Group related logs
  group(label: string): void {
    if (!isProduction) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (!isProduction) {
      console.groupEnd();
    }
  }
}

export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (...args: unknown[]) => logger.debug(...args),
  info: (...args: unknown[]) => logger.info(...args),
  warn: (...args: unknown[]) => logger.warn(...args),
  error: (...args: unknown[]) => logger.error(...args),
  group: (label: string) => logger.group(label),
  groupEnd: () => logger.groupEnd(),
};
