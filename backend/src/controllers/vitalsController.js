const Vitals = require('../models/Vitals');

exports.logVitals = async (req, res, next) => {
  try {
    const vitals = await Vitals.create({ ...req.body, recordedBy: req.user._id });
    await vitals.populate([{ path: 'patient', select: 'name' }, { path: 'recordedBy', select: 'name' }]);
    res.status(201).json({ success: true, data: vitals });
  } catch (err) { next(err); }
};

exports.getVitals = async (req, res, next) => {
  try {
    const query = req.query.patientId ? { patient: req.query.patientId } : {};
    const vitals = await Vitals.find(query)
      .populate('patient', 'name')
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: vitals });
  } catch (err) { next(err); }
};
