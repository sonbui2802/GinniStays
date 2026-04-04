const express = require('express');
const router = express.Router();

// A simple test route inside our router
router.get('/test', (req, res) => {
  res.json({ message: "Routes are wired up correctly!" });
});

// We will add authRoutes, propertyRoutes, etc. here later

module.exports = router;