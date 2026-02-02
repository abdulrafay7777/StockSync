const express = require('express');
const dotenv = require('dotenv');

dotenv.config(); 

const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); 

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const returnRoutes = require('./routes/returnRoute');

// Connect to Database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Static folder for uploaded screenshots
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/returns', returnRoutes);
app.use('/returns', returnRoutes);

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;