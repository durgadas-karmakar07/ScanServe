import mongoose from 'mongoose';
import { photoUrl } from '../utils/cloudinary.js';
import { photoSchema } from './photoSchema.js';

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    // Public part of the customer menu URL: /m/<slug>
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 40,
    },
    // One line under the name on the customer menu, e.g. "Home-style Bengali food".
    tagline: { type: String, trim: true, maxlength: 80, default: '' },
    upiId: { type: String, required: true, trim: true, maxlength: 321 },
    isAcceptingOrders: { type: Boolean, default: true },
    coverPhoto: { type: photoSchema, default: null },
    logo: { type: photoSchema, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// What customers see on the public menu: no UPI ID until they pay (step 1.7), no ids.
restaurantSchema.methods.toCustomer = function toCustomer() {
  return {
    name: this.name,
    slug: this.slug,
    tagline: this.tagline,
    isAcceptingOrders: this.isAcceptingOrders,
    coverUrl: photoUrl(this.coverPhoto, 'cover'),
    logoUrl: photoUrl(this.logo, 'logo'),
  };
};

// What the owner sees. Only these fields ever leave the server.
restaurantSchema.methods.toPublic = function toPublic() {
  return { id: this.id, ...this.toCustomer(), upiId: this.upiId };
};

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
