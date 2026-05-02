const express = require('express');
const router = express.Router();

// Inventory
const { getInventory, addItem, updateItem, deleteItem, getLowStock } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

const invRouter = express.Router();
invRouter.use(protect);
invRouter.get('/low-stock', authorize('pharmacist', 'admin'), getLowStock);
invRouter.route('/').get(authorize('pharmacist', 'admin')).get(getInventory).post(authorize('pharmacist', 'admin'), addItem);
invRouter.route('/:id').put(authorize('pharmacist', 'admin'), updateItem).delete(authorize('pharmacist', 'admin'), deleteItem);

// Vitals
const { logVitals, getVitals } = require('../controllers/vitalsController');
const vitalsRouter = express.Router();
vitalsRouter.use(protect);
vitalsRouter.route('/').get(authorize('nurse', 'doctor', 'admin'), getVitals).post(authorize('nurse'), logVitals);

// AI
const { chat } = require('../controllers/aiController');
const aiRouter = express.Router();
aiRouter.use(protect);
aiRouter.post('/chat', authorize('patient'), chat);

module.exports = { invRouter, vitalsRouter, aiRouter };
