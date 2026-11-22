// Trailing slashes are removed so `${API_URL}/api/...` never becomes `//api/...`.
export const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

function createError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

// Every request goes through here: it adds the base URL and JSON headers, and turns any failure
// into an Error with a `code` and a plain-language `message` that is safe to show on screen.
export async function request(path, { method = 'GET', body, signal } = {}) {
  if (!API_URL) {
    throw createError('CONFIG_ERROR', 'The app is not set up: VITE_API_URL is missing.');
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw createError('NETWORK_ERROR', 'Could not reach the server. Please try again.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw createError(
      data?.error?.code ?? 'HTTP_ERROR',
      data?.error?.message ?? 'Something went wrong. Please try again.',
    );
  }

  return data;
}
