const express = require('express');
const router = express.Router();
const { getPrescriptions, createPrescription, dispensePrescription } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getPrescriptions)
  .post(authorize('doctor'), createPrescription);
router.put('/:id/dispense', authorize('pharmacist'), dispensePrescription);

module.exports = router;
