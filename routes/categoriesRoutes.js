const express = require("express");
const {
  CreateCategory,
  GetAllCategories,
  DeleteCategoryById,
  UpdateCategoryById,
} = require("../controllers/categoriesController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware"); // Import the middleware

const router = express.Router();
router.get("/", GetAllCategories);

router.post("/", authMiddleware, CreateCategory);
router.put("/:id", UpdateCategoryById);

router.delete("/:id", DeleteCategoryById);

module.exports = router;
