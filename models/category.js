const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const Intern = require("../models/intern");
const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Intern,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);
Intern.hasMany(Category, { foreignKey: "created_by" });
Category.belongsTo(Intern, { foreignKey: "created_by" });

module.exports = Category;
