const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateTripDay,
} = require('../controllers/tripController');

// All these routes use 'protect' middleware — must be logged in
router.post('/', protect, createTrip);
router.get('/', protect, getMyTrips);
router.get('/:id', protect, getTripById);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);
router.put('/:id/regenerate-day', protect, regenerateTripDay);

module.exports = router;