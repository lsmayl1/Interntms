const express = require("express");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/admin-test", authMiddleware, isAdmin, (req, res) => {
  res.status(200).json({ message: "Access granted. You are an admin." });
});

module.exports = router; 