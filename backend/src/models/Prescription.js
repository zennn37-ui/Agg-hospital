const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicalRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' },
  medications: [{
    name: { type: String, required: true },
    dose: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    instructions: { type: String, default: '' },
  }],
  diagnosis: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'dispensed', 'partially_dispensed', 'cancelled'], default: 'pending' },
  dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dispensedAt: { type: Date },
  validUntil: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
