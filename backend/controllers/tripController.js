const Trip = require('../models/Trip');
const { generateItinerary, regenerateDay } = require('../services/aiService');
// CREATE a new trip

const createTrip = async (req, res) => {
  try {
    const { destination, days, budgetType, interests } = req.body;

    // Call AI to generate itinerary + budget
    const aiResult = await generateItinerary(destination, days, budgetType, interests);

    const newTrip = await Trip.create({
      user: req.userId,
      destination,
      days,
      budgetType,
      interests,
      itinerary: aiResult.itinerary,
      budgetEstimate: aiResult.budgetEstimate,
    });

    res.status(201).json({ message: 'Trip created', trip: newTrip });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET all trips for the logged-in user only
const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.userId });
    res.status(200).json({ trips });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET a single trip by ID (only if it belongs to this user)
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json({ trip });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE a trip (e.g., edit itinerary)
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, // must belong to this user
      req.body,
      { new: true }
    );
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json({ message: 'Trip updated', trip });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE a trip
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json({ message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const regenerateTripDay = async (req, res) => {
  try {
    const { dayNumber, preference } = req.body;

    const trip = await Trip.findOne({ _id: req.params.id, user: req.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const newDay = await regenerateDay(trip.destination, dayNumber, preference);
    console.log('AI returned new day:', newDay);
    // Replace that specific day in the itinerary array
    trip.itinerary = trip.itinerary.map((day) =>
      day.day === dayNumber ? newDay : day
    );
    await trip.save();

    res.status(200).json({ message: 'Day regenerated', trip });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = { createTrip, getMyTrips, getTripById, updateTrip, deleteTrip, regenerateTripDay };