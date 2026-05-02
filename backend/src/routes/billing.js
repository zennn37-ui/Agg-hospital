const express = require('express');
const { protect, authorize } = require('../middleware/auth');

// ── BILLING ──────────────────────────────────────────────
const billingRouter = express.Router();
const { getBills, createBill, updateBill, recordPayment, getBillingStats } = require('../controllers/billingController');

billingRouter.use(protect);
billingRouter.get('/stats', authorize('admin', 'receptionist'), getBillingStats);
billingRouter.route('/')
  .get(getBills)
  .post(authorize('receptionist', 'admin'), createBill);
billingRouter.route('/:id')
  .put(authorize('receptionist', 'admin'), updateBill);
billingRouter.put('/:id/pay', authorize('receptionist', 'admin'), recordPayment);

// ── BEDS ──────────────────────────────────────────────────
const bedRouter = express.Router();
const { getBeds, getBedStats, assignBed, releaseBed, createBed, updateBed } = require('../controllers/bedController');

bedRouter.use(protect);
bedRouter.get('/stats', getBedStats);
bedRouter.route('/')
  .get(getBeds)
  .post(authorize('admin', 'receptionist'), createBed);
bedRouter.route('/:id')
  .put(authorize('admin', 'receptionist'), updateBed);
bedRouter.put('/:id/assign', authorize('admin', 'receptionist', 'nurse'), assignBed);
bedRouter.put('/:id/release', authorize('admin', 'receptionist', 'nurse'), releaseBed);

module.exports = { billingRouter, bedRouter };
