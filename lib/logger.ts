// lib/logger.ts

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type LogLevelName = keyof typeof LOG_LEVELS;

// Determine the current log level.
// Default to 'DEBUG' in development, 'INFO' in production if NEXT_PUBLIC_LOG_LEVEL is not set.
const getCurrentLogLevel = (): LogLevelName => {
  const envLogLevel = process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase() as LogLevelName;
  if (envLogLevel && LOG_LEVELS[envLogLevel] !== undefined) {
    return envLogLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG';
};

const currentLogLevelName = getCurrentLogLevel();
const currentLogLevelValue = LOG_LEVELS[currentLogLevelName];

const canLog = (level: LogLevelName): boolean => {
  return LOG_LEVELS[level] >= currentLogLevelValue;
};

export const logger = {
  debug: (...args: any[]): void => {
    if (canLog('DEBUG')) {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]): void => {
    if (canLog('INFO')) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: any[]): void => {
    if (canLog('WARN')) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: any[]): void => {
    if (canLog('ERROR')) {
      console.error('[ERROR]', ...args);
    }
  },
  getCurrentLevel: (): LogLevelName => currentLogLevelName,
};

// Log the current effective log level once when the module is loaded
if (process.env.NODE_ENV !== 'production') {
  console.log(`[LOGGER] Effective log level: ${currentLogLevelName}`);
} 