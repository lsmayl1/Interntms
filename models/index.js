const sequelize = require('../config/config');
const Intern = require('./intern');
const Task = require('./task');

// Sync models with the database
const syncDatabase = async () => {
    await sequelize.sync({ alter: true });
};

module.exports = {
    syncDatabase,
    Intern,
    Task,
}; 