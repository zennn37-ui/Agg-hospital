const mongoose = require('mongoose');

const billingItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  category: { type: String, enum: ['Consultation', 'Lab', 'Pharmacy', 'Surgery', 'Room', 'Other'], default: 'Consultation' },
  amount: { type: Number, required: true, min: 0 },
  quantity: { type: Number, default: 1 },
});

const billingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [billingItemSchema],
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'partial', 'paid', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'insurance', ''], default: '' },
  notes: { type: String, default: '' },
  dueDate: { type: Date },
  paidAt: { type: Date },
}, { timestamps: true });

billingSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce((sum, i) => sum + i.amount * i.quantity, 0);
  if (this.paidAmount >= this.totalAmount && this.totalAmount > 0) this.status = 'paid';
  else if (this.paidAmount > 0) this.status = 'partial';
  next();
});

module.exports = mongoose.model('Billing', billingSchema);
