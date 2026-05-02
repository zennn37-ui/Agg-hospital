const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  genericName: { type: String, default: '' },
  category: { type: String, required: true },
  manufacturer: { type: String, default: '' },
  stock: { type: Number, required: true, min: 0, default: 0 },
  unit: { type: String, default: 'tablets' },
  price: { type: Number, default: 0 },
  expiryDate: { type: Date },
  batchNumber: { type: String, default: '' },
  minStockLevel: { type: Number, default: 50 },
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock'],
    default: 'in-stock',
  },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-update status based on stock
inventorySchema.pre('save', function (next) {
  if (this.stock === 0) this.status = 'out-of-stock';
  else if (this.stock <= this.minStockLevel) this.status = 'low-stock';
  else this.status = 'in-stock';
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
