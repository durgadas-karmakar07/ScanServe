import mongoose from 'mongoose';

// A Cloudinary photo: its id (folder path + name) and version. Delivery URLs are built from
// these when sending data out (utils/cloudinary.js), so sizes can change without a migration.
export const photoSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, maxlength: 255 },
    version: { type: Number, required: true },
  },
  { _id: false },
);
