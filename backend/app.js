const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const winston = require('winston');

// Initialize Express app
const app = express();

// Enable CORS for cross-origin requests
app.use(cors());

// Body-parser middleware
app.use(bodyParser.json());

// Configure Winston Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/restaurant', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
  logger.error('Database connection error:', err);
});
db.once('open', () => {
  logger.info('Successfully connected to the database.');
});

// Meal schema
const mealSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
});

const Meal = mongoose.model('Meal', mealSchema);

// Order schema
const orderSchema = new mongoose.Schema({
  customerName: String,
  items: [
    {
      mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
      quantity: Number
    }
  ],
  totalAmount: Number,
  status: String, // e.g., "Preparing", "On the Way", "Delivered"
});

const Order = mongoose.model('Order', orderSchema);

// API Endpoints

// Get all meals
app.get('/api/meals', async (req, res) => {
  try {
    const meals = await Meal.find();
    logger.info('Meals fetched from the database:', { meals });
    res.json(meals);
  } catch (err) {
    logger.error('Error fetching meals:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new meal
app.post('/api/meals', async (req, res) => {
  try {
    logger.info('New meal request received:', { body: req.body });
    const newMeal = new Meal(req.body);
    await newMeal.save();
    logger.info('New meal added to the database:', { newMeal });
    res.status(201).json(newMeal);
  } catch (err) {
    logger.error('Error adding meal:', err);
    res.status(400).json({ message: 'Failed to add meal' });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('items.mealId');
    logger.info('Orders fetched from the database:', { orders });
    res.json(orders);
  } catch (err) {
    logger.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new order
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    logger.info('New order added to the database:', { newOrder });
    res.status(201).json(newOrder);
  } catch (err) {
    logger.error('Error adding order:', err);
    res.status(400).json({ message: 'Failed to add order' });
  }
});

// Delete an order
app.delete('/api/orders/:id', async (req, res) => {
  try {
    logger.info('Order delete request received:', { id: req.params.id });
    await Order.findByIdAndDelete(req.params.id);
    logger.info('Order successfully deleted:', { id: req.params.id });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    logger.error('Error deleting order:', err);
    res.status(400).json({ message: 'Failed to delete order' });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
