// /lib/logger.ts

/**
 * Production-ready structured logging provider
 * Automatically outputs structured JSON in production for observability tools (GCP Logging, Datadog, ELK)
 * Outputs human-readable logs in development mode.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  message: string;
  level: LogLevel;
  timestamp: string;
  env: string;
  userId?: string | number;
  ip?: string;
  requestId?: string;
  path?: string;
  error?: any;
  [key: string]: any;
}

class Logger {
  private env = process.env.NODE_ENV || 'development';

  private formatError(err: any): any {
    if (err instanceof Error) {
      return {
        message: err.message,
        stack: err.stack,
        name: err.name,
      };
    }
    return err;
  }

  private write(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    const timestamp = new Date().toISOString();
    
    // Copy and convert error to serialized block if present
    const metaCopy = { ...meta };
    if (metaCopy.error) {
      metaCopy.error = this.formatError(metaCopy.error);
    }

    const payload: LogPayload = {
      timestamp,
      level,
      env: this.env,
      message,
      ...metaCopy,
    };

    if (this.env === 'production') {
      // Structured JSON logging for cloud/observability providers
      console.log(JSON.stringify(payload));
    } else {
      // Human-readable formatted logs for local development
      const colors = {
        info: '\x1b[36m', // Cyan
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
        debug: '\x1b[35m', // Magenta
      };
      const reset = '\x1b[0m';
      const color = colors[level] || reset;
      
      console.log(
        `[${timestamp}] ${color}${level.toUpperCase()}${reset}: ${message}`,
        Object.keys(metaCopy).length > 0 ? '\n' + JSON.stringify(metaCopy, null, 2) : ''
      );
    }

    // Capture in proper error tracking too if it is an error
    if (level === 'error') {
      import('@/lib/sentry').then((sentry) => {
        sentry.captureException(metaCopy.error || new Error(message), {
          extra: metaCopy,
          level: 'error',
        });
      }).catch(() => {});
    } else if (level === 'warn') {
      import('@/lib/sentry').then((sentry) => {
        sentry.captureException(metaCopy.error || new Error(message), {
          extra: metaCopy,
          level: 'warning',
        });
      }).catch(() => {});
    }
  }

  info(message: string, meta?: Record<string, any>) {
    this.write('info', message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.write('warn', message, meta);
  }

  error(message: string, meta?: Record<string, any>) {
    this.write('error', message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    this.write('debug', message, meta);
  }
}

export const logger = new Logger();
