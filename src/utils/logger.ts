/**
 * Lightweight logger that is silent in production builds.
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.debug('fetched', data);   // only printed when import.meta.env.DEV === true
 *   logger.warn('something odd');    // always printed (maps to console.warn)
 *   logger.error('fatal', err);      // always printed (maps to console.error)
 */

const isDev = import.meta.env.DEV;

/* eslint-disable no-console */
export const logger = {
  /** Debug-level messages — silenced in production. */
  debug: (...args: unknown[]): void => {
    if (isDev) console.log(...args);
  },

  /** Informational messages — silenced in production. */
  info: (...args: unknown[]): void => {
    if (isDev) console.info(...args);
  },

  /** Warnings — always visible. */
  warn: (...args: unknown[]): void => {
    console.warn(...args);
  },

  /** Errors — always visible. */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
};
/* eslint-enable no-console */
