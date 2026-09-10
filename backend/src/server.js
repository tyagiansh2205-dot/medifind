const express = require('express');
const app = express();
const cors = require('cors');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const medicineRoutes = require('./routes/medicines');
const pharmacyRoutes = require('./routes/pharmacies');
const reservationRoutes = require('./routes/reservations');
const prescriptionRoutes = require('./routes/prescriptions');

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(5000, () => {
  console.log('🚀 MediFind secure core listening cleanly on port 5000');
});