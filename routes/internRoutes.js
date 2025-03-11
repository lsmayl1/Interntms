const express = require("express");
const multer = require("multer");
const path = require("path"); // Import path module
const {
  getAllInterns,
  createIntern,
  getInternById,
  updateIntern,
  deleteIntern,
  getUserData,
  updateUserData,
} = require("../controllers/internController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware"); // Import the middleware
const { Intern } = require("../models/intern"); // Ensure this path is correct

const router = express.Router();

// Set up Multer storage
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

// Protect the route with authMiddleware and isAdmin
router.get("/", authMiddleware, getAllInterns);
router.get("/me", authMiddleware, getUserData);
router.post("/", authMiddleware, createIntern);
router.put("/me/edit", upload.single("avatar"), authMiddleware, updateUserData);

router.get("/:id", authMiddleware, getInternById);
router.put("/:id", authMiddleware, upload.single("avatar"), updateIntern);
router.delete("/:id", authMiddleware, deleteIntern);

module.exports = router;
