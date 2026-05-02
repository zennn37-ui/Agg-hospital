const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');

// @desc   Get all users (admin) or all doctors (public)
// @route  GET /api/users
// @access Private
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, total, data: users });
  } catch (err) { next(err); }
};

// @desc   Get single user
// @route  GET /api/users/:id
// @access Private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @desc   Create user (admin)
// @route  POST /api/users
// @access Private (admin)
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    const userObj = user.toObject(); delete userObj.password;
    res.status(201).json({ success: true, data: userObj });
  } catch (err) { next(err); }
};

// @desc   Update user (admin)
// @route  PUT /api/users/:id
// @access Private (admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @desc   Deactivate user
// @route  DELETE /api/users/:id
// @access Private (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) { next(err); }
};

// @desc   Get admin dashboard stats
// @route  GET /api/users/admin/stats
// @access Private (admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalPatients, totalDoctors, totalStaff, totalAppointments, todayAppointments, pendingPrescriptions] = await Promise.all([
      User.countDocuments({ role: 'patient', isActive: true }),
      User.countDocuments({ role: 'doctor', isActive: true }),
      User.countDocuments({ role: { $in: ['nurse','receptionist','pharmacist'] }, isActive: true }),
      Appointment.countDocuments({}),
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Prescription.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      success: true, data: {
        totalPatients, totalDoctors, totalStaff, totalAppointments,
        todayAppointments, pendingPrescriptions,
      }
    });
  } catch (err) { next(err); }
};

// @desc   Get vitals for nurse
// @route  GET /api/users/nurse/patients
// @access Private (nurse)
exports.getNursePatients = async (req, res, next) => {
  try {
    const admitted = await User.find({ role: 'patient', isActive: true }).select('-password').limit(10);
    res.json({ success: true, data: admitted });
  } catch (err) { next(err); }
};
