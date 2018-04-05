var bcrypt = require("bcrypt");
var crypto = require('crypto');
let models = require("./models/index")
async function getTodoById(id)
{
    let todos = await models.Todo.findById(id)
    if(todos != null && todos != undefined)
    {
        return todos
    }
    return Promise.reject()
    return null;
}

async function compareLoginAndPassword(pUsername , pPass)
{
    
    let users = await models.User.findOne({ where: {username: pUsername } })
    
    if(users != null && users != undefined)
    {
        let isPassTrue = await compareCryptedPass(pPass , users.password)
        
        if(isPassTrue)
        {
            
            return users.toJSON()
        }
        else
        {
            
            return Promise.reject();
        }
        
    }
    return Promise.reject()
}

async function cryptPass(pass)
{
    let passHashed = bcrypt.hash(pass, 10)
    return await passHashed
}

async function compareCryptedPass(pass , hash)
{
    let test = await bcrypt.compare(pass, hash)
    return test
}

async function checkUserExist(username)
{
    let users = await models.User.findOne({where: {username : username}})
    if(users != null && users != undefined)
    {
        return true
    }
    else
    {
        return false
    }
}

function randomValueHex (len) {

    return crypto.randomBytes(16)
        .toString('hex') // convert to hexadecimal format
        
}

async function saveUser(username , password)
{
    let api = await randomValueHex(Date.now())
    let pass = await cryptPass(password)
    let users  = await models.User.create({
        username:username,
        password:pass,
        apiKey: api,
        TeamId:1
        // TODO : changer pour demander a l'utilisateur si il veut séleectionner sa propre team
    })
    
    if(users != null && users != undefined)
    {
        return users
    }
    else
    {
        return Promise.reject()
    }
}

module.exports.saveUser = saveUser;
module.exports.randomValueHex = randomValueHex;
module.exports.checkUserExist = checkUserExist;
module.exports.compareCryptedPass = compareCryptedPass;
module.exports.cryptPass = cryptPass;
module.exports.compareLoginAndPassword = compareLoginAndPassword;
module.exports.getTodoById = getTodoById;