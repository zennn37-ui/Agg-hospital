const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc   Create appointment
// @route  POST /api/appointments
// @access Private (patient, receptionist)
exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, time, type, department, symptoms, notes } = req.body;
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') return res.status(404).json({ success: false, message: 'Doctor not found' });

    const patientId = req.user.role === 'patient' ? req.user._id : req.body.patientId;
    const appointment = await Appointment.create({
      patient: patientId, doctor: doctorId, date, time, type, department, symptoms, notes,
      fee: doctor.doctorInfo?.consultationFee || 0,
    });
    await appointment.populate(['patient', 'doctor']);
    res.status(201).json({ success: true, data: appointment });
  } catch (err) { next(err); }
};

// @desc   Get appointments (role-based)
// @route  GET /api/appointments
// @access Private
exports.getAppointments = async (req, res, next) => {
  try {
    let query = {};
    const { status, date, page = 1, limit = 20 } = req.query;

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;
    if (status) query.status = status;
    if (date) { const d = new Date(date); query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) }; }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone patientInfo')
      .populate('doctor', 'name email doctorInfo')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, count: appointments.length, total, data: appointments });
  } catch (err) { next(err); }
};

// @desc   Get single appointment
// @route  GET /api/appointments/:id
// @access Private
exports.getAppointment = async (req, res, next) => {
  try {
    const apt = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone patientInfo')
      .populate('doctor', 'name doctorInfo');
    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: apt });
  } catch (err) { next(err); }
};

// @desc   Update appointment status
// @route  PUT /api/appointments/:id
// @access Private
exports.updateAppointment = async (req, res, next) => {
  try {
    const apt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('patient', 'name email')
      .populate('doctor', 'name');
    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: apt });
  } catch (err) { next(err); }
};

// @desc   Cancel appointment
// @route  DELETE /api/appointments/:id
// @access Private
exports.cancelAppointment = async (req, res, next) => {
  try {
    const apt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancelReason: req.body.reason || 'Cancelled by user' },
      { new: true }
    );
    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: apt });
  } catch (err) { next(err); }
};

// @desc   Get today's appointments count (dashboard)
// @route  GET /api/appointments/stats
// @access Private
exports.getAppointmentStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    let matchQuery = {};
    if (req.user.role === 'doctor') matchQuery.doctor = req.user._id;

    const [total, todayCount, pending, confirmed] = await Promise.all([
      Appointment.countDocuments(matchQuery),
      Appointment.countDocuments({ ...matchQuery, date: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ ...matchQuery, status: 'pending' }),
      Appointment.countDocuments({ ...matchQuery, status: 'confirmed' }),
    ]);
    res.json({ success: true, data: { total, today: todayCount, pending, confirmed } });
  } catch (err) { next(err); }
};
