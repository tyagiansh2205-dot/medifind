const prisma = require('../lib/prisma');

// Approve a pharmacy
exports.approvePharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pharmacy = await prisma.pharmacy.update({
      where: { id: id },
      data: { status: 'APPROVED' }
    });

    res.status(200).json({ message: "Pharmacy approved successfully!", pharmacy });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ error: "Failed to approve pharmacy." });
  }
};

// Get all pending pharmacies for the admin dashboard
exports.getPendingPharmacies = async (req, res) => {
  try {
    const pending = await prisma.pharmacy.findMany({
      where: { status: 'PENDING' },
      include: { owner: true }
    });
    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch pending requests." });
  }
};