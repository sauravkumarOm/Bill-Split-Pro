const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/group');
const userRoutes = require('./routes/user');
const errorHandler = require('./middlewares/errorHandler');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settlements', groupRoutes); 
app.use('/api/payments', paymentRoutes);

app.get('/', (req,res) => {
    res.json({ok: true, msg: 'BillSplit Pro Backend is running'})
});

app.use(errorHandler);

module.exports = app;

