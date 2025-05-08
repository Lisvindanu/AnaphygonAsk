const express = require('express');
const path = require('path');
const logger = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import controllers
const homeController = require('./controllers/homeController');
const chatController = require('./controllers/chatController');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3003;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', homeController.index);
app.get('/chat', chatController.showChat);
app.post('/api/chat', chatController.processQuestion);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});