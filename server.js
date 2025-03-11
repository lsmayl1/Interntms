const express = require("express");
const cors = require("cors"); // Import the cors package
const { syncDatabase } = require("./models/index");
const internRoutes = require("./routes/internRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const categoriesRoutes = require("./routes/categoriesRoutes");
const testRoutes = require("./routes/testRoutes"); // Import the test routes
const errorHandler = require("./middleware/errorMiddleware"); // Import the error handling middleware
require("dotenv").config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// CORS configuration
app.use(cors());

// Serve static files from the "uploads" directory
app.use("/uploads", express.static("uploads"));

// Sync database
syncDatabase()
  .then(() => {
    console.log("Database synced successfully");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

// Use routes
app.use("/interns", internRoutes);
app.use("/tasks", taskRoutes);
app.use("/auth", authRoutes);
app.use("/categories", categoriesRoutes);
app.use("/test", testRoutes); // Use the test routes

// Use the error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
