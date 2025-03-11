const { Intern, Task } = require("../models/index");
const bcrypt = require("bcryptjs");

const SERVER_URL = process.env.SERVER_URL;

const getAllInterns = async (req, res) => {
  try {
    const interns = await Intern.findAll();
    // Map through interns to include only the desired fields and avatar URLs
    const internsWithDetails = interns.map((intern) => ({
      id: intern.id,
      first_name: intern.first_name,
      last_name: intern.last_name,
      username: intern.username,
      email: intern.email,
      phone: intern.phone,
      status: intern.status,
      role: intern.role,
      avatar: intern.avatar, // Include the full avatar URL
    }));
    res.status(200).json(internsWithDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createIntern = async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    status,
    password,
    role, // Include role in the request body
  } = req.body;

  try {
    // Check if the email already exists
    const existingIntern = await Intern.findOne({ where: { email } });
    if (existingIntern) {
      return res.status(409).json({ error: "Email already in use." }); // Conflict
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newIntern = await Intern.create({
      first_name,
      last_name,
      email,
      phone,
      status: status || "active", // Default to "active" if not provided
      password: hashedPassword, // Store the hashed password
      role: role || "User", // Default to "User" if not provided
    });
    res.status(201).json(newIntern);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

const getInternById = async (req, res) => {
  const { id } = req.params;
  try {
    const intern = await Intern.findByPk(id);
    if (!intern) {
      return res.status(404).json({ error: "Intern not found" });
    }

    res.status(200).json({
      id: intern.id,
      first_name: intern.first_name,
      last_name: intern.last_name,
      email: intern.email,
      phone: intern.phone,
      status: intern.status,
      role: intern.role,
      avatar: getAvatarUrl(intern.avatar), // Include the full avatar URL
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateIntern = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone, status, role } = req.body;
  const avatar = req.file ? req.file.path : null;

  try {
    const intern = await Intern.findByPk(id);
    if (!intern) {
      return res.status(404).json({ error: "Intern not found" });
    }

    // Check if the user is trying to update their own profile
    const isSelfUpdate = req.user.id === intern.id;

    // If the user is not updating their own profile, check if they are an admin
    if (!isSelfUpdate && req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    await intern.update({
      first_name,
      last_name,
      email,
      phone,
      status,
      role: isSelfUpdate ? intern.role : role, // Allow self-updating without changing role
      avatar,
    });

    res.status(200).json({
      id: intern.id,
      first_name: intern.first_name,
      last_name: intern.last_name,
      email: intern.email,
      phone: intern.phone,
      status: intern.status,
      role: intern.role,
      avatar: avatarUrl,
    });
  } catch (error) {
    console.error("Error updating intern:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteIntern = async (req, res) => {
  const { id } = req.params;
  try {
    const intern = await Intern.findByPk(id);
    if (!intern) {
      return res.status(404).json({ error: "Intern not found" });
    }
    await intern.destroy();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserData = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  const intern_id = req.user.id;

  try {
    // Import models - adjust the path to where your models are defined

    // First, get the intern data
    const intern = await Intern.findByPk(intern_id);

    if (!intern) {
      return res.status(404).json({ error: "User not found." });
    }

    // Then, find all tasks assigned to this intern
    const assignedTasks = await Task.findAll({
      where: {
        intern_id: intern_id,
      },
    });

    // Combine the data and send the response
    res.status(200).json({
      id: intern.id,
      first_name: intern.first_name,
      last_name: intern.last_name,
      email: intern.email,
      phone: intern.phone,
      status: intern.status,
      role: intern.role,
      avatar: intern.avatar, // Assuming this is the avatar URL field
      tasks: assignedTasks, // Add the tasks array here
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateUserData = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  const intern_id = req.user.id;
  const { username, first_name, last_name, email, phone, status } = req.body;
  const avatar = req.file
    ? `${SERVER_URL}/${req.file.path}`
    : `${SERVER_URL}/uploads/profile.png`; // Dosya yükleme
  console.log("Request Body:", req.body);
  console.log("Uploaded File:", req.file);

  try {
    const intern = await Intern.findByPk(intern_id);

    if (!intern) {
      return res.status(404).json({ error: "User not found." });
    }

    // Kullanıcı verilerini güncelle
    await intern.update({
      username,
      first_name,
      last_name,
      email,
      phone,
      status,
      avatar,
    });

    // Güncellenmiş veriyi döndür
    res.status(200).json({
      message: "User data updated successfully.",
      user: intern,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllInterns,
  createIntern,
  getInternById,
  updateIntern,
  deleteIntern,
  getUserData,
  updateUserData,
};
