const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'nurse', 'receptionist', 'pharmacist'],
    required: true,
  },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  isActive: { type: Boolean, default: true },

  // Patient-specific
  patientInfo: {
    dateOfBirth: Date,
    bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-',''] , default: '' },
    gender: { type: String, enum: ['Male','Female','Other',''] , default: '' },
    address: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    allergies: [String],
    chronicConditions: [String],
  },

  // Doctor-specific
  doctorInfo: {
    specialization: { type: String, default: '' },
    qualification: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    licenseNumber: { type: String, default: '' },
    consultationFee: { type: Number, default: 0 },
    schedule: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    totalPatients: { type: Number, default: 0 },
  },

  // Nurse-specific
  nurseInfo: {
    ward: { type: String, default: '' },
    shift: { type: String, enum: ['Morning','Evening','Night',''], default: '' },
    qualification: { type: String, default: '' },
  },

  // Pharmacist / Receptionist
  staffInfo: {
    department: { type: String, default: '' },
    employeeId: { type: String, default: '' },
  },

}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getInitials = function () {
  return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

module.exports = mongoose.model('User', userSchema);
