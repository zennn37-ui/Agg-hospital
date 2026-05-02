const express = require('express');
const router = express.Router();
const { createRecord, getRecords, getRecord, updateRecord } = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(authorize('patient', 'doctor', 'nurse', 'admin'), getRecords)
  .post(authorize('doctor'), createRecord);
router.route('/:id')
  .get(authorize('patient', 'doctor', 'nurse', 'admin'), getRecord)
  .put(authorize('doctor'), updateRecord);

module.exports = router;
