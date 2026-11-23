import { MenuItem } from '../models/MenuItem.js';
import { AppError } from '../utils/AppError.js';

const MAX_MENU_ITEMS = 200;

const notFound = () =>
  new AppError(404, 'MENU_ITEM_NOT_FOUND', 'This dish was not found. It may have been deleted.');

// Every query filters by restaurantId from the token (never from the request), so an owner can
// only ever see or change their own dishes. Another café's dish id simply gives 404.

export async function listMenu(req, res) {
  const items = await MenuItem.find({ restaurantId: req.auth.restaurantId }).sort({
    sortOrder: 1,
    _id: 1,
  });
  res.json({ items: items.map((item) => item.toPublic()) });
}

export async function createMenuItem(req, res) {
  const { restaurantId } = req.auth;
  const count = await MenuItem.countDocuments({ restaurantId });
  if (count >= MAX_MENU_ITEMS) {
    throw new AppError(409, 'MENU_FULL', `A menu can have up to ${MAX_MENU_ITEMS} dishes.`);
  }

  const last = await MenuItem.findOne({ restaurantId }).sort({ sortOrder: -1 }).select('sortOrder');
  const item = await MenuItem.create({
    ...req.valid.body,
    restaurantId,
    sortOrder: (last?.sortOrder ?? 0) + 1,
  });
  res.status(201).json({ item: item.toPublic() });
}

export async function updateMenuItem(req, res) {
  const item = await MenuItem.findOne({
    _id: req.valid.params.id,
    restaurantId: req.auth.restaurantId,
  });
  if (!item) throw notFound();

  item.set(req.valid.body);
  await item.save();
  res.json({ item: item.toPublic() });
}

export async function deleteMenuItem(req, res) {
  const { deletedCount } = await MenuItem.deleteOne({
    _id: req.valid.params.id,
    restaurantId: req.auth.restaurantId,
  });
  if (deletedCount === 0) throw notFound();
  res.status(204).end();
}
