import mongoose from 'mongoose';

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
    upiId: { type: String, required: true, trim: true, maxlength: 321 },
    isAcceptingOrders: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Only these fields ever leave the server.
restaurantSchema.methods.toPublic = function toPublic() {
  return {
    id: this.id,
    name: this.name,
    slug: this.slug,
    upiId: this.upiId,
    isAcceptingOrders: this.isAcceptingOrders,
  };
};

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
