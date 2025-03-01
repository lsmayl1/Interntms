const { Task } = require("../models/index");
const { Intern } = require("../models/index");

// Get all tasks for a specific intern
const getTasksByInternId = async (req, res) => {
  const { internId } = req.params;
  try {
    const tasks = await Task.findAll({ where: { intern_id: internId } });
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create a new task for an intern
const createTask = async (req, res) => {
  const { title, description, status, due_date, priority, assignto } = req.body;

  console.log("Request Body:", req.body); // Log the request body

  // Check if the user is authenticated and has a valid token
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  try {
    const task = await Task.create({
      title,
      description,
      status,
      due_date,
      priority,
      intern_id: assignto, // Use the intern_id from the token
    });
    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findByPk(id, {
      include: [
        {
          model: Intern,
          attributes: ["id", "username", "avatar"],
        },
      ],
    });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a task by ID
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, due_date, priority, intern_id } =
    req.body;

  try {
    const task = await Task.findByPk(id, {
      include: {
        model: Intern,
        attributes: ["id", "first_name", "avatar"], // Intern için sadece gerekli alanları seçiyoruz
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Eğer intern_id değişiyorsa, geçerli olup olmadığını kontrol et
    if (intern_id) {
      const intern = await Intern.findByPk(intern_id);
      if (!intern) {
        return res.status(400).json({ error: "Invalid Intern ID" });
      }
    }

    // Görevi güncelle
    await task.update({
      title,
      description,
      status,
      due_date,
      priority,
      intern_id: intern_id || task.intern_id, // Eğer intern_id varsa güncelle, yoksa eskisini koru
    });

    // Güncellenmiş task verisini tekrar yükle
    await task.reload({
      include: {
        model: Intern,
        attributes: ["id", "username", "avatar"],
      },
    });

    // intern_id'yi silerek yanıtı döndür
    const taskWithoutInternId = { ...task.get(), intern_id: undefined };

    res.status(200).json(taskWithoutInternId);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a task by ID
const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: Intern,
          attributes: ["id", "username", "avatar"],
        },
      ],
    });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    await task.destroy();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Example function to get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: Intern,
          attributes: ["id", "username", "avatar"],
        },
      ],
    });
    res.status(200).json(tasks);
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
    const internData = await Intern.findByPk(intern_id);
    if (!internData) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(internData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getTasksByInternId,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasks,
  getUserData,
};
