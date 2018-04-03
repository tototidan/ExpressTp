const Sequelize = require('sequelize');

 const sequelize =  new Sequelize('node', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    port:3306,
  
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  
    
    // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
    operatorsAliases: false
  });
  
global.todo =sequelize.define('todo', {
    id:
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message: Sequelize.STRING,
    completion: Sequelize.BOOLEAN,
    userId: Sequelize.INTEGER
  
  });
global.user = sequelize.define("user",
{
    id:
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    apiKey : Sequelize.STRING,
});

global.teams = sequelize.define("teams",
{
    id:
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type:Sequelize.STRING,
        defaultValue:1
    }
})

user.hasMany(todo , {as: "userId"})
teams.hasMany(user , {as: "team"})
teams.hasMany(todo , {as: "teamId"})
todo.belongsTo(user)
  

sequelize.sync()


