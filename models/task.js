const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const Intern = require("./intern");
const Category = require("./category");
const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    intern_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Intern,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "pending",
      validate: {
        isIn: [["To_do", "in_progress", "Done", "pending"]],
      },
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING(20),
      defaultValue: "Low",
      validate: {
        isIn: [["Low", "Medium", "High"]],
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Establish relationships
Intern.hasMany(Task, { foreignKey: "intern_id", as: "assigned_to" });
Task.belongsTo(Intern, { foreignKey: "intern_id", as: "assigned_to" });

Category.hasMany(Task, { foreignKey: "category_id", as: "category" });
Task.belongsTo(Category, { foreignKey: "category_id", as: "category" });
module.exports = Task;
