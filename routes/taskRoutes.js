const express = require("express");
const multer = require("multer");

const {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  SaveImg,
} = require("../controllers/taskController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware"); // Import the middleware

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory for uploaded files
  },
  filename: (req, file, cb) => {
    // Use the original file name with a timestamp
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage }); // Use the custom storage configuration

const router = express.Router();

// Protect the route with authMiddleware and isAdmin
router.get("/", authMiddleware, getAllTasks); // Only admins can access this route
router.post("/", authMiddleware, createTask); // Protect this route
router.get("/:id", authMiddleware, getTaskById); // Protect this route
router.put("/:id", updateTask); // Protect this route
router.delete("/:id", authMiddleware, deleteTask); // Protect this route
router.post("/img", upload.single("image"), SaveImg);
module.exports = router;
