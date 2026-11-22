// Expected errors (not found, conflict, bad input). The error handler sends their code and
// message to the client; anything else becomes a generic 500.
export class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}
