const LOG_PREFIX = '[VidFlow]';

const log = (level, tag, message, data) => {
  if (level !== 'error' && !__DEV__) return;

  const line = `${LOG_PREFIX} [${tag}] ${message}`;
  if (data !== undefined) {
    console[level === 'error' ? 'error' : 'log'](line, data);
  } else {
    console[level === 'error' ? 'error' : 'log'](line);
  }
};

export const logger = {
  info: (tag, message, data) => log('info', tag, message, data),
  warn: (tag, message, data) => log('warn', tag, message, data),
  error: (tag, message, data) => log('error', tag, message, data),
};

export const logAxiosError = (tag, err) => {
  const details = {
    message: err.message,
    code: err.code,
    url: err.config?.baseURL
      ? `${err.config.baseURL}${err.config.url}`
      : err.config?.url,
    method: err.config?.method?.toUpperCase(),
    params: err.config?.params,
    status: err.response?.status,
    statusText: err.response?.statusText,
    responseData: err.response?.data,
  };

  logger.error(tag, 'Request failed', details);
  return details;
};
