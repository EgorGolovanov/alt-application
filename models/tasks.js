'use strict';
module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('tasks', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false
    });
    
    return Task;
}