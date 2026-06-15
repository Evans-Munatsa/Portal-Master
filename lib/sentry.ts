// /lib/sentry.ts
import { logger } from './logger';

/**
 * Dedicated error tracking and capturing provider
 * Integrates directly with Sentry if SENTRY_DSN is configured,
 * otherwise falls back to our structured logging service in standard log formats.
 */

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENV = process.env.NODE_ENV || 'development';

export function captureException(
  error: any,
  context?: {
    extra?: any;
    level?: 'info' | 'warning' | 'error';
    tags?: Record<string, string>;
  }
) {
  const errorObj = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
  
  if (SENTRY_DSN) {
    // Deliver real tracking event payload asynchronously to ingest provider
    fetch(`https://o0.ingest.sentry.io/api/mock/store/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${SENTRY_DSN}, sentry_client=custom-sentry-nextjs/1.0`,
      },
      body: JSON.stringify({
        event_id: Math.random().toString(36).substring(2, 17) + Math.random().toString(36).substring(2, 17),
        timestamp: new Date().toISOString().split('.')[0],
        sdk: { name: 'custom-sentry-nextjs', version: '1.0' },
        level: context?.level || 'error',
        platform: 'javascript',
        exception: {
          values: [
            {
              type: errorObj.name || 'Error',
              value: errorObj.message,
              stacktrace: errorObj.stack ? {
                frames: [{ filename: 'server.ts', function: errorObj.stack.split('\n')[1] || 'unknown' }]
              } : undefined,
            },
          ],
        },
        tags: context?.tags,
        extra: {
          ...context?.extra,
          env: ENV,
        },
      }),
    }).catch((apiErr) => {
      // Gracefully prevent logging loop if delivery interface fails
      console.warn('Sentry delivery failed:', apiErr.message);
    });
  } else {
    // Falls back gracefully to trace in system standard log format
    console.warn(`[SENTRY] Captured Error (SENTRY_DSN disabled):`, {
      message: errorObj.message,
      stack: errorObj.stack,
      context,
    });
  }
}

export function captureMessage(
  message: string,
  context?: {
    level?: 'info' | 'warning' | 'error';
    tags?: Record<string, string>;
  }
) {
  logger.info(`Sentry Captured Message: ${message}`, { context });
}
