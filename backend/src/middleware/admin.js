// src/middleware/admin.js
const isAdmin = (req, res, next) => {
  // We assume 'authenticateToken' ran first, which sets req.user
  if (req.user && req.user.role === 'ADMIN') {
    next(); // They are an admin, proceed
  } else {
    res.status(403).json({ error: "Access Denied: Admins only." });
  }
};

module.exports = { isAdmin };