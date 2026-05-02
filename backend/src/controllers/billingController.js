const Billing = require('../models/Billing');

exports.getBills = async (req, res, next) => {
  try {
    const { status, patientId, page = 1, limit = 20 } = req.query;
    let query = {};
    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (patientId) query.patient = patientId;
    if (status) query.status = status;

    const total = await Billing.countDocuments(query);
    const bills = await Billing.find(query)
      .populate('patient', 'name email phone')
      .populate('appointment', 'date time department')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, count: bills.length, total, data: bills });
  } catch (err) { next(err); }
};

exports.createBill = async (req, res, next) => {
  try {
    const bill = await Billing.create({ ...req.body, createdBy: req.user._id });
    await bill.populate(['patient', 'createdBy']);
    res.status(201).json({ success: true, data: bill });
  } catch (err) { next(err); }
};

exports.updateBill = async (req, res, next) => {
  try {
    const bill = await Billing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('patient', 'name email phone');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (err) { next(err); }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;
    const bill = await Billing.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    bill.paidAmount = (bill.paidAmount || 0) + Number(amount);
    bill.paymentMethod = paymentMethod || bill.paymentMethod;
    if (bill.paidAmount >= bill.totalAmount) { bill.status = 'paid'; bill.paidAt = new Date(); }
    else bill.status = 'partial';
    await bill.save();
    await bill.populate('patient', 'name email');
    res.json({ success: true, data: bill });
  } catch (err) { next(err); }
};

exports.getBillingStats = async (req, res, next) => {
  try {
    const [total, pending, paid, partial] = await Promise.all([
      Billing.countDocuments({}),
      Billing.countDocuments({ status: 'pending' }),
      Billing.countDocuments({ status: 'paid' }),
      Billing.countDocuments({ status: 'partial' }),
    ]);
    const revenue = await Billing.aggregate([{ $group: { _id: null, total: { $sum: '$paidAmount' }, pending: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } } } }]);
    res.json({ success: true, data: { total, pending, paid, partial, revenue: revenue[0] || { total: 0, pending: 0 } } });
  } catch (err) { next(err); }
};
