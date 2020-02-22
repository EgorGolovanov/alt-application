module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('users', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        avatar_url: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: false
    });
    
    User.associate = function(models) {
        User.hasMany(models.tasks, {
            foreignKey: 'user_id'
        });
    }

    return User;
}