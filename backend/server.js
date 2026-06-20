const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('Mongo URI loaded:', process.env.MONGO_URI);

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const tripRoutes = require('./routes/tripRoutes');
app.use('/api/trips', tripRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});