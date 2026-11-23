import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
  },
  // Never returned by queries unless asked for with .select('+passwordHash').
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['owner'], default: 'owner' },
  // Bumped on password change or "log out everywhere"; tokens with an older value stop working.
  tokenVersion: { type: Number, default: 0 },
});

// Only these fields ever leave the server.
staffSchema.methods.toPublic = function toPublic() {
  return { id: this.id, name: this.name, email: this.email, role: this.role };
};

export const Staff = mongoose.model('Staff', staffSchema);
