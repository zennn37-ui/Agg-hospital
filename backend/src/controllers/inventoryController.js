const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };
    const items = await Inventory.find(query).sort({ name: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) { next(err); }
};

exports.addItem = async (req, res, next) => {
  try {
    const item = await Inventory.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item removed' });
  } catch (err) { next(err); }
};

exports.getLowStock = async (req, res, next) => {
  try {
    const items = await Inventory.find({ status: { $in: ['low-stock', 'out-of-stock'] } });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) { next(err); }
};
