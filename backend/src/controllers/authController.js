const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, legalStoreName } = req.body;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create User
    const newUser = await prisma.user.create({
      data: { name, email, passwordHash, role: role || 'CUSTOMER' }
    });

    // Handle Pharmacy Owner logic
    if (role === 'OWNER') {
 // Inside your exports.register function
await prisma.pharmacy.create({
  data: {
    ownerId: newUser.id,
    name: legalStoreName || name,
    status: 'PENDING',
    // These fields are required by your schema, so we must provide them:
    licenseNumber: "PENDING",
    address: "PENDING",
    city: "PENDING",
    state: "PENDING",
    pincode: "000000",
    // Document URLs
    gstDocumentUrl: req.files?.['gstDocument']?.[0]?.filename || null,
    panDocumentUrl: req.files?.['panDocument']?.[0]?.filename || null,
    licenseDocumentUrl: req.files?.['licenseDocument']?.[0]?.filename || null,
    addressProofUrl: req.files?.['addressProof']?.[0]?.filename || null
  }
});
    }

    res.status(201).json({ message: "Registration successful", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed." });
  }
};

const DEMO_ACCOUNTS = [
  { id: "usr_admin", name: "Admin (J. Verma)", email: "admin@medifind.test", password: "Admin@1234", role: "ADMIN" },
  { id: "usr_admin2", name: "Admin (J. Verma)", email: "admin@test.medifind", password: "Admin@001", role: "ADMIN" },
  { id: "usr_cust1", name: "Aarav Sharma", email: "customer@medifind.test", password: "Customer@1234", role: "CUSTOMER" },
  { id: "usr_cust2", name: "Aarav Sharma", email: "aarav.sharma@test.medifind", password: "Test@001", role: "CUSTOMER" },
  { id: "usr_pharm1", name: "Dr. A. Kumar", email: "pharmacist@medifind.test", password: "Pharmacist@1234", role: "PHARMACIST" },
  { id: "usr_pharm2", name: "Dr. A. Kumar", email: "pharmacist.wellness@test.medifind", password: "Pharm@001", role: "PHARMACIST" },
  { id: "usr_owner1", name: "Priya Nair", email: "owner@medifind.test", password: "Owner@1234", role: "OWNER", Pharmacy: { id: "p1", name: "Wellness Plus Pharmacy", status: "APPROVED" } },
  { id: "usr_owner2", name: "Vikram Rao", email: "pending.owner@medifind.test", password: "Owner@1234", role: "OWNER", Pharmacy: { id: "p2", name: "CityCare Chemists", status: "PENDING" } },
];

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = null;

    try {
      user = await prisma.user.findUnique({ where: { email }, include: { Pharmacy: true } });
    } catch (dbErr) {
      console.warn("Database offline, falling back to demo credentials check:", dbErr.message);
    }

    if (user) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      // Check demo accounts
      const demoUser = DEMO_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === (email || '').toLowerCase() && acc.password === password
      );
      if (demoUser) {
        user = {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          Pharmacy: demoUser.Pharmacy || null,
        };
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Check demo credentials.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret');
    return res.json({ token, user });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "An unexpected server error occurred during login." });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json(user);
  } catch (error) {
    const demoUser = DEMO_ACCOUNTS.find((acc) => acc.id === req.user.userId);
    if (demoUser) {
      return res.json(demoUser);
    }
    res.status(500).json({ error: "Could not retrieve user." });
  }
};