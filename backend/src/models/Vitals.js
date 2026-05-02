const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodPressure: { type: String, default: '' },
  pulse: { type: String, default: '' },
  temperature: { type: String, default: '' },
  weight: { type: String, default: '' },
  spo2: { type: String, default: '' },
  bloodSugar: { type: String, default: '' },
  notes: { type: String, default: '' },
  ward: { type: String, default: '' },
  bed: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Vitals', vitalsSchema);
