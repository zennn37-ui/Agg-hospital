const express = require('express');
const router = express.Router();
const {
  createAppointment, getAppointments, getAppointment,
  updateAppointment, cancelAppointment, getAppointmentStats
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getAppointmentStats);
router.route('/')
  .get(getAppointments)
  .post(authorize('patient', 'receptionist', 'admin'), createAppointment);
router.route('/:id')
  .get(getAppointment)
  .put(authorize('doctor', 'receptionist', 'admin'), updateAppointment)
  .delete(authorize('patient', 'receptionist', 'admin'), cancelAppointment);

module.exports = router;
