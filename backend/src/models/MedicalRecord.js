const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dose: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String, default: '' },
});

const vitalSchema = new mongoose.Schema({
  bloodPressure: { type: String, default: '' },
  pulse: { type: String, default: '' },
  temperature: { type: String, default: '' },
  weight: { type: String, default: '' },
  height: { type: String, default: '' },
  spo2: { type: String, default: '' },
  bloodSugar: { type: String, default: '' },
});

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: { type: String, required: true },
  symptoms: { type: String, default: '' },
  medications: [medicationSchema],
  vitals: vitalSchema,
  notes: { type: String, default: '' },
  labReports: [{ name: String, result: String, date: Date }],
  followUpDate: { type: Date },
  isAccessibleByNurse: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
