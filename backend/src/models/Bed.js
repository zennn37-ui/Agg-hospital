const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, unique: true },
  ward: { type: String, required: true, enum: ['Ward A', 'Ward B', 'Ward C', 'ICU', 'Pediatrics', 'Maternity', 'Emergency', 'OPD'] },
  type: { type: String, enum: ['General', 'Semi-Private', 'Private', 'ICU'], default: 'General' },
  status: { type: String, enum: ['available', 'occupied', 'maintenance', 'reserved'], default: 'available' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  admittedAt: { type: Date },
  expectedDischarge: { type: Date },
  notes: { type: String, default: '' },
  floor: { type: Number, default: 1 },
  pricePerDay: { type: Number, default: 1000 },
}, { timestamps: true });

module.exports = mongoose.model('Bed', bedSchema);
