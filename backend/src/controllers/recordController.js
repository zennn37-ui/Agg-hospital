const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');

// @desc   Create medical record
// @route  POST /api/records
// @access Private (doctor)
exports.createRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.create({ ...req.body, doctor: req.user._id });

    // Also create a prescription if medications exist
    if (req.body.medications && req.body.medications.length > 0) {
      await Prescription.create({
        patient: req.body.patient,
        doctor: req.user._id,
        medicalRecord: record._id,
        medications: req.body.medications,
        diagnosis: req.body.diagnosis,
        notes: req.body.prescriptionNotes || '',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
    await record.populate([
      { path: 'patient', select: 'name email patientInfo' },
      { path: 'doctor', select: 'name doctorInfo' },
    ]);
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

// @desc   Get medical records for a patient
// @route  GET /api/records
// @access Private (patient sees own, doctor/nurse see all)
exports.getRecords = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.query.patientId) query.patient = req.query.patientId;

    const records = await MedicalRecord.find(query)
      .populate('patient', 'name email patientInfo')
      .populate('doctor', 'name doctorInfo')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (err) { next(err); }
};

// @desc   Get single record
// @route  GET /api/records/:id
// @access Private
exports.getRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'name email patientInfo')
      .populate('doctor', 'name doctorInfo');
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

// @desc   Update medical record (doctor only)
// @route  PUT /api/records/:id
// @access Private (doctor)
exports.updateRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id },
      req.body, { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found or unauthorized' });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};
