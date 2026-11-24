import mongoose from 'mongoose';

export const ORDER_STATUSES = ['new', 'ready', 'paid', 'cancelled'];
// Orders the customer still has to collect or pay for.
export const OPEN_ORDER_STATUSES = ['new', 'ready'];

// Name and price are copied when the order is placed, so a later menu change never changes an
// order that was already placed.
const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1, max: 20 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    deviceId: { type: String, required: true },
    customerName: { type: String, required: true, trim: true, maxlength: 30 },
    // 1, 2, 3… for this café today; starts again at 1 the next business day.
    orderNumber: { type: Number, required: true },
    businessDate: { type: String, required: true }, // 'YYYY-MM-DD', Asia/Kolkata
    items: { type: [orderItemSchema], required: true },
    // Calculated by the server from the menu, never taken from the client.
    total: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'new' },
    paymentMethod: { type: String, enum: ['upi', 'cash', null], default: null },
    paidMarkedBy: { type: String, enum: ['customer', 'owner', null], default: null },
    // A random id the phone sends with each checkout. If the answer is lost and the customer taps
    // Place order again, the same id returns the order already saved instead of a second one.
    checkoutId: { type: String },
    readyAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ deviceId: 1, createdAt: -1 });
// A number is never given out twice on the same day, even if something goes wrong.
orderSchema.index({ restaurantId: 1, businessDate: 1, orderNumber: 1 }, { unique: true });
// One order per checkout id per phone (orders without a checkout id are not indexed).
orderSchema.index(
  { deviceId: 1, checkoutId: 1 },
  { unique: true, partialFilterExpression: { checkoutId: { $type: 'string' } } },
);

// What the customer's phone sees. No restaurant, device or menu item ids.
orderSchema.methods.toCustomer = function toCustomer() {
  return {
    id: this.id,
    orderNumber: this.orderNumber,
    customerName: this.customerName,
    items: this.items.map(({ name, price, qty }) => ({ name, price, qty })),
    total: this.total,
    status: this.status,
    paymentMethod: this.paymentMethod,
    createdAt: this.createdAt,
    readyAt: this.readyAt,
    paidAt: this.paidAt,
    cancelledAt: this.cancelledAt,
  };
};

// What the kitchen screen shows: who, what and when. Prices are included for the total only.
orderSchema.methods.toKitchen = function toKitchen() {
  return {
    id: this.id,
    orderNumber: this.orderNumber,
    customerName: this.customerName,
    items: this.items.map(({ name, price, qty }) => ({ name, price, qty })),
    total: this.total,
    status: this.status,
    createdAt: this.createdAt,
    readyAt: this.readyAt,
    cancelledAt: this.cancelledAt,
  };
};

export const Order = mongoose.model('Order', orderSchema);
