const Bed = require('../models/Bed');

exports.getBeds = async (req, res, next) => {
  try {
    const { ward, status } = req.query;
    let query = {};
    if (ward) query.ward = ward;
    if (status) query.status = status;
    const beds = await Bed.find(query).populate('patient', 'name patientInfo').sort({ ward: 1, bedNumber: 1 });
    res.json({ success: true, count: beds.length, data: beds });
  } catch (err) { next(err); }
};

exports.getBedStats = async (req, res, next) => {
  try {
    const wards = ['Ward A', 'Ward B', 'Ward C', 'ICU', 'Pediatrics', 'Emergency'];
    const stats = await Promise.all(wards.map(async (ward) => {
      const total = await Bed.countDocuments({ ward });
      const occupied = await Bed.countDocuments({ ward, status: 'occupied' });
      const available = await Bed.countDocuments({ ward, status: 'available' });
      const maintenance = await Bed.countDocuments({ ward, status: 'maintenance' });
      return { ward, total, occupied, available, maintenance, occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0 };
    }));
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

exports.assignBed = async (req, res, next) => {
  try {
    const { patientId, expectedDischarge, notes } = req.body;
    const bed = await Bed.findByIdAndUpdate(
      req.params.id,
      { status: 'occupied', patient: patientId, admittedAt: new Date(), expectedDischarge, notes },
      { new: true }
    ).populate('patient', 'name patientInfo');
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
    res.json({ success: true, data: bed });
  } catch (err) { next(err); }
};

exports.releaseBed = async (req, res, next) => {
  try {
    const bed = await Bed.findByIdAndUpdate(
      req.params.id,
      { status: 'available', patient: null, admittedAt: null, expectedDischarge: null, notes: '' },
      { new: true }
    );
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
    res.json({ success: true, data: bed });
  } catch (err) { next(err); }
};

exports.createBed = async (req, res, next) => {
  try {
    const bed = await Bed.create(req.body);
    res.status(201).json({ success: true, data: bed });
  } catch (err) { next(err); }
};

exports.updateBed = async (req, res, next) => {
  try {
    const bed = await Bed.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
    res.json({ success: true, data: bed });
  } catch (err) { next(err); }
};
