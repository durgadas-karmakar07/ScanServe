import { MenuItem } from '../models/MenuItem.js';
import { assertOwnPhoto, removeReplacedPhoto } from '../services/photo.service.js';
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
  assertOwnPhoto(req.valid.body.photo, restaurantId, 'dish', 'photo');

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
  const { restaurantId } = req.auth;
  const changes = req.valid.body;
  assertOwnPhoto(changes.photo, restaurantId, 'dish', 'photo');

  const item = await MenuItem.findOne({ _id: req.valid.params.id, restaurantId });
  if (!item) throw notFound();

  const oldPhoto = item.photo?.toObject();
  item.set(changes);
  await item.save();
  if ('photo' in changes) removeReplacedPhoto(oldPhoto, changes.photo);
  res.json({ item: item.toPublic() });
}

export async function deleteMenuItem(req, res) {
  const item = await MenuItem.findOneAndDelete({
    _id: req.valid.params.id,
    restaurantId: req.auth.restaurantId,
  });
  if (!item) throw notFound();
  removeReplacedPhoto(item.photo, null);
  res.status(204).end();
}
