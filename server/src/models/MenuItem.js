import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    category: { type: String, required: true, trim: true, maxlength: 30 },
    // Whole rupees only (₹120 is 120).
    price: {
      type: Number,
      required: true,
      min: 1,
      max: 99999,
      validate: { validator: Number.isInteger, message: 'Price must be whole rupees' },
    },
    isVeg: { type: Boolean, required: true },
    // false = sold out today: still listed, but customers cannot order it.
    isAvailable: { type: Boolean, default: true },
    // Set by the server when a dish is added, so the menu keeps the owner's order.
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

menuItemSchema.index({ restaurantId: 1, sortOrder: 1 });

// Only these fields ever leave the server.
menuItemSchema.methods.toPublic = function toPublic() {
  return {
    id: this.id,
    name: this.name,
    category: this.category,
    price: this.price,
    isVeg: this.isVeg,
    isAvailable: this.isAvailable,
    sortOrder: this.sortOrder,
  };
};

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
