const express = require("express");
const {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware"); // Import the middleware

const router = express.Router();

// Protect the route with authMiddleware and isAdmin
router.get("/", authMiddleware, getAllTasks); // Only admins can access this route
router.post("/", authMiddleware, createTask); // Protect this route
router.get("/:id", authMiddleware, getTaskById); // Protect this route
router.put("/:id", updateTask); // Protect this route
router.delete("/:id", authMiddleware, deleteTask); // Protect this route

module.exports = router;
