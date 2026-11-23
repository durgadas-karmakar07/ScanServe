import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const isValidTimeZone = (timeZone) => {
  try {
    new Intl.DateTimeFormat('en-IN', { timeZone });
    return true;
  } catch {
    return false;
  }
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z
    .string({ error: 'is required' })
    .regex(/^mongodb(\+srv)?:\/\//, 'must start with mongodb:// or mongodb+srv://'),
  JWT_SECRET: z.string({ error: 'is required' }).min(32, 'must be at least 32 characters'),
  // CORS compares origins exactly, so "http://localhost:5173/" (trailing slash) would block every request.
  CLIENT_ORIGIN: z
    .url({ error: 'must be a full URL, e.g. http://localhost:5173' })
    .refine((value) => new URL(value).origin === value, {
      error: 'must be an origin with no path or trailing slash, e.g. http://localhost:5173',
    }),
  TZ_BUSINESS: z
    .string()
    .default('Asia/Kolkata')
    .refine(isValidTimeZone, { error: 'must be a valid time zone, e.g. Asia/Kolkata' }),
  // Photo uploads (Cloudinary). Optional: without them the app works and photo upload is off.
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .regex(/^[a-z0-9_-]{1,64}$/i, 'must be the cloud name from the Cloudinary dashboard')
    .optional(),
  CLOUDINARY_API_KEY: z
    .string()
    .regex(/^\d{6,20}$/, 'must be the numeric API key')
    .optional(),
  CLOUDINARY_API_SECRET: z.string().min(10, 'looks too short').optional(),
});

const CLOUDINARY_KEYS = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

// Treat blank lines like `PORT=` as "not set" so defaults apply instead of empty strings.
const rawEnv = Object.fromEntries(
  Object.keys(envSchema.shape).map((key) => [key, process.env[key] || undefined]),
);

const result = envSchema
  .refine(
    (values) => {
      const setCount = CLOUDINARY_KEYS.filter((key) => values[key]).length;
      return setCount === 0 || setCount === CLOUDINARY_KEYS.length;
    },
    { error: 'set all three CLOUDINARY_* variables, or none', path: ['CLOUDINARY_*'] },
  )
  .safeParse(rawEnv);

if (!result.success) {
  // Print only variable names and problems, never the values (they may be secrets).
  console.error('Invalid environment variables (server/.env locally, or the host settings):');
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = Object.freeze(result.data);
export const isProduction = env.NODE_ENV === 'production';
