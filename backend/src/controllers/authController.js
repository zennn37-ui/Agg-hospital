const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const userObj = user.toObject();
  delete userObj.password;
  res.status(statusCode).json({ success: true, token, user: userObj });
};

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, patientInfo, doctorInfo, nurseInfo, staffInfo } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'patient', phone });
    sendTokenResponse(user, 201, res);
  } catch (err) { next(err); }
};

// @desc   Login
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

// @desc   Get current user
// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc   Update profile
// @route  PUT /api/auth/profile
// @access Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, patientInfo, doctorInfo, nurseInfo, staffInfo } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, patientInfo, doctorInfo, nurseInfo, staffInfo },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @desc   Change password
// @route  PUT /api/auth/password
// @access Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};
