const { Task, Category, Intern } = require("../models/index");

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
  const { title, description, due_date, priority, assignto, category_id } =
    req.body;

    

  console.log("Request Body:", req.body);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  if (
    !title ||
    !description ||
    !due_date ||
    !priority ||
    !assignto ||
    !category_id
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const [user, category] = await Promise.all([
      Intern.findByPk(assignto),
      Category.findByPk(category_id),
    ]);

    if (!user) {
      return res.status(404).json({ error: "Assigned intern not found." });
    }

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const task = await Task.create({
      title,
      description,
      due_date,
      priority,
      intern_id: assignto,
      category_id: category_id,
    });

    task.intern = { id: user.id, username: user.username, avatar: user.avatar }; // Assuming 'name' is a field in the Intern model

    task.category = {
      id: category.id,
      name: category.name,
      color: category.color,
    };

    return res.status(201).json({
      task: {
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        assigntoW: task.intern,
        category: task.category,
      },
    });
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
          as: "assigned_to",
        },
        {
          model: Category,
          attributes: ["id", "name", "color"],
          as: "category",
        },
      ],
    });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assigned_to: task.assigned_to,
      category: task.category,
      due_date: task.due_date,
      createdAt: task.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a task by ID
const updateTask = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    due_date,
    priority,
    intern_id,
    category_id,
  } = req.body;

  try {
    // Task'ı ilk bulma ve kontrol
    const task = await Task.findByPk(id, {
      include: [
        {
          model: Intern,
          attributes: ["id", "first_name", "avatar"],
          as: "assigned_to",
        },
        {
          model: Category,
          attributes: ["id", "name", "color"],
          as: "category",
        },
      ],
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Intern_id kontrolü ve güncelleme verilerini hazırla
    const updateData = {
      title,
      description,
      status,
      due_date,
      priority,
      category_id,
      intern_id: task.intern_id, // Varsayılan olarak mevcut intern_id
    };

    if (intern_id && intern_id !== task.intern_id) {
      const intern = await Intern.findByPk(intern_id);
      if (!intern) {
        return res.status(400).json({ error: "Invalid Intern ID" });
      }
      updateData.intern_id = intern_id;
    }

    // Görevi güncelle
    await task.update(updateData);

    // Güncellenmiş veriyi tek bir sorguda al
    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: Intern,
          attributes: ["id", "first_name", "avatar"], // username yerine first_name kullanıldı
          as: "assigned_to",
        },
        {
          model: Category,
          attributes: ["id", "name", "color"],
          as: "category",
        },
      ],
      attributes: { exclude: ["intern_id", "category_id"] }, // intern_id'yi direkt burada hariç tutabiliriz
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Task update error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a task by ID
const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    await task.destroy();
    res.status(204).end();
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
          model: Intern, // alias KULLANMADAN
          attributes: ["id", "username", "avatar"],
          as: "assigned_to",
        },
        {
          model: Category, // alias KULLANMADAN
          attributes: ["id", "name", "color"],
          as: "category",
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

const SaveImg = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image not uploaded" });
  }
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.json({ url: fileUrl });
};

module.exports = {
  getTasksByInternId,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasks,
  SaveImg,
  getUserData,
};
