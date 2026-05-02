const Prescription = require('../models/Prescription');
const Inventory = require('../models/Inventory');

// @desc   Get prescriptions
// @route  GET /api/prescriptions
// @access Private
exports.getPrescriptions = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;
    if (req.query.status) query.status = req.query.status;

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email patientInfo')
      .populate('doctor', 'name doctorInfo')
      .populate('dispensedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (err) { next(err); }
};

// @desc   Create prescription
// @route  POST /api/prescriptions
// @access Private (doctor)
exports.createPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.create({ ...req.body, doctor: req.user._id });
    await prescription.populate(['patient', 'doctor']);
    res.status(201).json({ success: true, data: prescription });
  } catch (err) { next(err); }
};

// @desc   Dispense prescription
// @route  PUT /api/prescriptions/:id/dispense
// @access Private (pharmacist)
exports.dispensePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    if (prescription.status === 'dispensed') return res.status(400).json({ success: false, message: 'Already dispensed' });

    prescription.status = 'dispensed';
    prescription.dispensedBy = req.user._id;
    prescription.dispensedAt = new Date();
    await prescription.save();
    await prescription.populate(['patient', 'doctor', 'dispensedBy']);
    res.json({ success: true, data: prescription });
  } catch (err) { next(err); }
};
