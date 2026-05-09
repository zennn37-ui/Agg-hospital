const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser, getAdminStats, getNursePatients } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/admin/stats', authorize('admin'), getAdminStats);
router.get('/nurse/patients', authorize('nurse'), getNursePatients);
router.route('/')
  .get(authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), getUsers)
  .post(authorize('admin'), createUser);
router.route('/:id')
  .get(getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;
