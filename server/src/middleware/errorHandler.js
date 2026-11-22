import { AppError } from '../utils/AppError.js';

// express.json() marks its own errors with a `type`; map them to our error codes.
const BODY_PARSER_ERRORS = {
  'entity.parse.failed': { code: 'INVALID_JSON', message: 'Request body is not valid JSON' },
  'entity.too.large': { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large' },
};

export function notFound(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));
}

// Express treats a middleware with 4 arguments as the error handler.
export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
  }

  if (err.type && err.status >= 400 && err.status < 500) {
    const known = BODY_PARSER_ERRORS[err.type] ?? { code: 'BAD_REQUEST', message: 'Bad request' };
    return res.status(err.status).json({ error: known });
  }

  // Unexpected: log details on the server, send the client a generic message with no stack trace.
  console.error(`[${req.method} ${req.originalUrl}]`, err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
  });
}
