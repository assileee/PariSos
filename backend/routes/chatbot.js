const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { 
  sendMessage, 
  toggleChecklistItem, 
  getChecklist 
} = require("../controllers/chatbotControllers");

// All chatbot routes require authentication
router.use(verifyToken);

// Chat endpoints
router.post("/message", sendMessage);

// Checklist endpoints
router.get("/checklist", getChecklist);
router.patch("/checklist/toggle/:itemId", toggleChecklistItem);

// Export checklist as PDF/JSON (optional feature)
router.get("/checklist/export", async (req, res) => {
  const userId = req.userId;
  const format = req.query.format || 'json';
  
  try {
    const Checklist = require("../models/checklistModels");
    const checklist = await Checklist.findOne({ userId }).sort({ createdAt: -1 });
    
    if (!checklist) {
      return res.status(404).json({ message: "No checklist found" });
    }
    
    if (format === 'json') {
      res.setHeader('Content-Disposition', 'attachment; filename="paris-checklist.json"');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(checklist.items, null, 2));
    } else {
      // For PDF export, you'd need to implement PDF generation
      // Using libraries like puppeteer or pdfkit
      res.status(501).json({ message: "PDF export not yet implemented" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error exporting checklist", error: error.message });
  }
});

module.exports = router;