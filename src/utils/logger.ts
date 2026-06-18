/**
 * Logging utility for the application
 *
 * This provides a centralized logging mechanism that can be easily replaced
 * with a proper logging service (e.g., Sentry, LogRocket) in production.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(level: LogLevel, message: string, context?: unknown): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private log(level: LogLevel, message: string, context?: unknown): void {
    const entry = this.formatLog(level, message, context);

    if (this.isDevelopment) {
      // In development, use console methods
      switch (level) {
        case 'info':
          console.info('[INFO]', entry.message, context || '');
          break;
        case 'warn':
          console.warn('[WARN]', entry.message, context || '');
          break;
        case 'error':
          console.error('[ERROR]', entry.message, context || '');
          break;
      }
    } else {
      // In production, send to logging service
      // TODO: Integrate with Sentry, LogRocket, or similar
      // For now, still use console.error for critical errors
      if (level === 'error') {
        console.error('[ERROR]', entry.message, context || '');
      }
    }
  }

  info(message: string, context?: unknown): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: unknown): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: unknown): void {
    this.log('error', message, context);
  }
}

// Export singleton instance
export const logger = new Logger();
