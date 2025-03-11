const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Intern } = require("../models/index");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your .env file
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET; // Add this to your .env file

// Register route
router.post("/register", async (req, res) => {
  const { first_name, last_name, username, email, phone, password } = req.body;
  try {
    // Check if the email already exists
    const existingEmail = await Intern.findOne({ where: { email } });
    const existingUsername = await Intern.findOne({
      where: { username },
    });

    if (existingEmail) {
      return res.status(409).json({ error: "Email already in use." });
    }
    if (existingUsername) {
      return res.status(409).json({ error: "Username already in use." });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new intern
    const newIntern = await Intern.create({
      username,
      first_name,
      last_name,
      email,
      phone,
      status: "active",
      password: hashedPassword, // Store the hashed password
      role: "User", // Set default role to 'User'
      avatar: "http://localhost:3000/uploads/profile.png",
    });

    // Respond with the newly created intern (excluding the password)
    res.status(201).json({
      id: newIntern.id,
      username: newIntern.username,
      first_name: newIntern.first_name,
      last_name: newIntern.last_name,
      email: newIntern.email,
      phone: newIntern.phone,
      status: newIntern.status,
      role: newIntern.role,
      avatar: newIntern.avatar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const intern = await Intern.findOne({ where: { email } });
    if (!intern) {
      return res.status(401).json({ error: "Invalid credentials." }); // Unauthorized
    }
    const isPasswordValid = await bcrypt.compare(password, intern.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." }); // Unauthorized
    }

    const accessToken = jwt.sign(
      { id: intern.id, role: intern.role }, // role ekledik
      JWT_SECRET,
      { expiresIn: "1D" }
    );

    const refreshToken = jwt.sign(
      { id: intern.id, role: intern.role }, // role ekledik
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Optionally store the refresh token in the database
    await intern.update({ refresh_token: refreshToken });

    // Respond with the tokens and user role
    res.status(200).json({
      accessToken,
      refreshToken,
      role: intern.role, // Include the user's role in the response
    }); // Send both tokens and role in the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Refresh token route
router.post("/refresh", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401); // Unauthorized

  try {
    const intern = await Intern.findOne({ where: { refresh_token: token } });
    if (!intern) return res.sendStatus(403); // Forbidden

    jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403); // Forbidden
      const accessToken = jwt.sign(
        { id: user.id, role: intern.role }, // id ve role ekledik
        JWT_SECRET,
        { expiresIn: "1D" } // Doğru zaman formatı
      );
      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
