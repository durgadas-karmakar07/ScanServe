import { AppError } from '../utils/AppError.js';

const PARTS = ['params', 'query', 'body'];

function toValidationError(zodError) {
  const fields = {};
  for (const issue of zodError.issues) {
    const field = issue.path[0];
    if (field !== undefined && !(field in fields)) fields[field] = issue.message;
  }
  const hasFields = Object.keys(fields).length > 0;
  return new AppError(
    400,
    'VALIDATION_ERROR',
    hasFields ? 'Please check the highlighted fields.' : 'The request was not valid.',
    hasFields ? fields : undefined,
  );
}

// Checks params, query and body against zod schemas before the controller runs.
// Express 5 makes req.query read-only, so parsed values go to req.valid for every part.
export const validate = (schemas) => (req, res, next) => {
  const valid = {};
  for (const part of PARTS) {
    if (!schemas[part]) continue;
    const result = schemas[part].safeParse(req[part] ?? {});
    if (!result.success) throw toValidationError(result.error);
    valid[part] = result.data;
  }
  req.valid = valid;
  next();
};
