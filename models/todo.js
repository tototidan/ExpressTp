'use strict';
module.exports = (sequelize, DataTypes) => {
  var Todo = sequelize.define('Todo', {
    id:
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message: DataTypes.STRING,
    completion: DataTypes.BOOLEAN,
    
  });

  Todo.associate = function(models) {
    Todo.belongsTo(models.User)
  };

  return Todo;
};