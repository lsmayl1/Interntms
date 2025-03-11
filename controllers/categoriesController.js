const Category = require("../models/category");
const Intern = require("../models/intern");
const GetAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Intern,
          attributes: ["id", "username", "avatar"],
        },
      ],
    });
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      created_by: {
        id: category.Intern.id,
        username: category.Intern.username, // Intern'ün name'ini username olarak döndür
        avatar: category.Intern.avatar,
      },
    }));
    res.status(200).json(formattedCategories);
  } catch (err) {}
};

const CreateCategory = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, color } = req.body;
    if (!name && !color) {
      return res
        .status(400)
        .json({ error: "Cateogory and color field cant be null" });
    }
    const Newcateogry = await Category.create({
      name,
      color,
      created_by: userId,
    });

    const intern = await Intern.findByPk(userId, {
      attributes: ["id", "username"], // Yalnızca id ve name (username olarak kullanıyorsun sanırım) al
    });

    if (!intern) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    return res.status(201).json({
      message: "Kategori başarıyla oluşturuldu",
      category: {
        id: Newcateogry.id,
        name: Newcateogry.name,
        color: Newcateogry.color,
        created_by: {
          id: intern.id,
          username: intern.username, // Intern modelinde 'name' alanını username olarak kullanıyoruz
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const UpdateCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, created_by } = req.body;

    // ID'nin geçerli olup olmadığını kontrol et
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Geçersiz kategori ID" });
    }

    // Kategoriyi bul
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: "Kategori bulunamadı" });
    }

    // Eğer created_by sağlanmışsa, geçerli bir Intern ID'si olup olmadığını kontrol et
    if (created_by !== undefined) {
      const intern = await Intern.findByPk(created_by);
      if (!intern) {
        return res.status(400).json({
          error: "Geçersiz Intern ID: Bu ID'ye sahip bir kullanıcı bulunamadı",
        });
      }
    }

    // Kategoriyi güncelle
    await category.update({
      name: name || category.name,
      color: color || category.color,
      created_by: created_by || category.created_by,
    });

    // Başarılı yanıt döndür
    return res.status(200).json({
      message: "Kategori başarıyla güncellendi",
    });
  } catch (error) {
    console.error("Kategori güncelleme hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
};

const DeleteCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Id don`t given" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    await category.destroy();

    return res.status(200).json({
      message: "Category deleted",
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  CreateCategory,
  GetAllCategories,
  DeleteCategoryById,
  UpdateCategoryById,
};
