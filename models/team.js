'use strict';
module.exports = (sequelize, DataTypes) => {
  var Team = sequelize.define('Team', {
    id:
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        defaultValue:1
    }
  });

  Team.associate = function(models) {
    Team.hasMany(models.User , {as: "team"})
    Team.hasMany(models.Todo , {as: "teamId"})
  };

  return Team;
};