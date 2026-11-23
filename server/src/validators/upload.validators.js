import { z } from 'zod';
import { PHOTO_KINDS } from '../utils/cloudinary.js';

export const uploadSignatureSchema = z
  .object({ kind: z.enum(PHOTO_KINDS, { error: 'Unknown photo type' }) })
  .strict();
