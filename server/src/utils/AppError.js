// Expected errors (not found, conflict, bad input). The error handler sends their code and
// message to the client; anything else becomes a generic 500. `fields` maps a form field to
// a message so the client can show it next to that field.
export class AppError extends Error {
  constructor(statusCode, code, message, fields) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
  }
}
