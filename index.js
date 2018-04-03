const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const pug = require('pug');
let cookieParser = require('cookie-parser');
let session = require('express-session');
require("./SequeliseInit")
let utilFunction = require("./utilFunction")
const Sequelize = require('sequelize');
const op = Sequelize.Op;

app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.all("*" , (req,res,next)=>
{
    /*
    * Chech if the user is connected or his api key is valid
    * if none of these conditions are fullfiled , we throw him on the login page
    * */
    checkUser(req,res,next)

    
})   
app.listen(8080);

app.all("/", (req , res)=>
{
    res.redirect("/todos");
});


/*****************************************Create todo section */
/*
* Method : POST
* We create a todo 
*
*/

app.route('/add')
.get( (req,res) =>
{
    res.status(200).send(pug.renderFile(process.cwd()+"/view/home/createtodo.pug")) 
})
app.post("/todos", (req,res) =>
{
    if(req.body.message )
    {
            
            todo.create({
            message:req.body.message,
            completion:false,
            userId: req.session.userId,
            teamId: req.body.addToTeam != undefined ? req.session.teamId : null
        }).then((user)=>
        {
            // you will meet this condition really often , we check the content type to know if the request want HTML or JSON as response
            if(req.accepts("json" , "html")=== "json")
            {
                res.status(200)
                return res.send(user.toJSON())
            }
            else
            {
                return res.status(200).send(pug.renderFile(process.cwd()+"/view/home/createtodo.pug",{created:true}))
            }
        })
        .catch(()=>
        {
            return res.status(200).send(pug.renderFile(process.cwd()+"/view/home/createtodo.pug",{errorbdd:true}))
        })
        
    }
    // if no msg , then we cant create the todo , so we throw him back
    else
    {
        if(req.accepts("json" , "html") === "json")
        {
            return res.send(400)
        }
        else
        {
            return res.status(200).send(pug.renderFile(process.cwd()+"/view/home/createtodo.pug", {fullFillAll:true}) )
        }
    }
});


//***************************************************End create todo section********************** */
// ************************************************* DELETE SECTION**************************************
app.post('/todos/:todoid/delete', (req,res)=>
{
    hackDelete(req,res)
})
app.delete('/todos/:todoid', (req,res) =>
{
    hackDelete(req,res)
})

/*
* only the creator of the todo can delete it 
* We use a function to be able to delete from a form and not only from request with a tools
* we just check that the todo belong to the user who want to delete it 
*/
function hackDelete(req,res)
{
    
    todo.destroy(
        {
            where: {id: req.params.todoid , userId: req.session.userId}
        }
    ).then((number)=>
    {
        if(number == 1)
        {
            if(req.accepts("json","html") === "json")
            {
                return res.status(200).send("Record deleted")
            }
            else
            {
                req.session.msg = "La todo a bien été supprimé";
                return res.redirect("/todos") 
            }
        }
        else
        {
            if(req.accepts("json"))
            {
                return res.send(503)
            }
            else
            {
                req.session.msg = "La todo n'a pas été supprimé , veuillez réessayer plus tard ou contacter un administrateur";
                return res.redirect("/todos")
            } 
        }
    })
}

//******************************************************************************************************************** */

//***************************************************************EDIT SECTION */


app.route("/todos/:todoid/edit")
.get( (req,res) =>
{
    todo.find({where:{userId: req.session.userId , id: req.params.todoid }}).then((myTodo)=>
    {
        if(myTodo != null)
        {
           return res.status(200).send(pug.renderFile(process.cwd()+"/view/home/edit.pug", {mytodo: myTodo})) 
        }
        else
        {
            req.session.msg = "Une erreur s'est produite lors du traitement de votre requête , veuillez réessayer plus tard ou contacter un administrateur";
            res.redirect("/todos") 
        }
    })
})
.post((req,res)=>
{
    
    if(req.body.patch)
    {
        patchHack(req,res)
    }
    else
    {
        req.session.msg = "Une erreur s'est produite lors du traitement de votre requête , veuillez réessayer plus tard ou contacter un administrateur";
        res.redirect("/todos") 
    }
})


app.patch('/todos/:todoid', (req,res) =>
{
    patchHack(req,res)
})
    
/*
* Only the creator of the todo can update or delete it 
*
*/
function patchHack(req,res)
{
    if(!req.body.completion && !req.body.message && !req.params.todoid)
    {
        if(req.accepts("json" , "html") === "json")
            {
               return res.status(400).send("Missing parameters")
            }
            else
            {   
               return res.status(200).send(pug.renderFile(process.cwd()+"/view/home/edit.pug", {fullfilAll:true})) 
            } 
    }
    
    let completionStatus = 1
    todo.update(
        {
            message: req.body.message,
            completion: req.body.completion != undefined ? 1 : 0   
        },
        {
            where:{id: req.params.todoid , userId : req.session.userId},  
        }
    ).then((status)=>
    {
        if(status[0] == 0)
        {
           return res.status(200).send(pug.renderFile(process.cwd()+"/view/home/edit.pug", {errorNotUpdated:true}))
        }
        utilFunction.getTodoById(req.params.todoid).then((Todo)=>
        {
            if(req.accepts("json" , "html") === "json")
            {
               return res.status(200).send(Todo.toJSON())
            }
            else
            {
                return res.status(200).send(pug.renderFile(process.cwd()+"/view/home/edit.pug", {mytodo:Todo , updated:true}))
            }
        }).catch((error)=>
        {
            if(req.accepts("json" , "html") === "json")
            {
               return res.status(400).send("Error while processing , try again later or contact a administrator" + error)
            }
            else
            {
                return res.status(200).send(pug.renderFile(process.cwd()+"/view/home/edit.pug", {errorNotUpdated:true}))
            }
        })
    }).catch((error)=>
        {
            if(req.accepts("json" , "html") === "json")
            {
                return res.status(400).send("Cant alter this todo")
            }
            else
            {
                return res.status(200).send(pug.renderFile(process.cwd()+"/view/home/edit.pug", {errorNotUpdated:true}))
            }
        })
}

//*******************************************************End edit section************************ */


//***************************************************Create account section************************ */
app.route("/createAccount")
.get(function(req,res)
{
    if(req.session.connected)
    {
        res.redirect("/todos");
    }
    else
    {
        return res.send(pug.renderFile(process.cwd() +"/view/createaccount/create.pug"))
    }
})

.post(function(req,res)
{
    if(req.body.password && req.body.password2 && req.body.username)
    {
        if(req.body.password == req.body.password2)
        {
            utilFunction.checkUserExist(req.body.username).then((exist)=>
            {
                if(exist)
                {
                    return res.send(pug.renderFile(process.cwd() +"/view/createaccount/create.pug" , {userExist: true}))
                }
                else
                {
                   utilFunction.saveUser(req.body.username , req.body.password).then((user)=>
                {
                   return res.send(pug.renderFile(process.cwd() +"/view/login/login.pug",{accountCreated:true}))
                })
                .catch((e)=>
                {
                   return res.send(pug.renderFile(process.cwd() +"/view/createaccount/create.pug" , {error: true}))
                })
                }
            }).catch((error)=>
            {
                
                return res.send(pug.renderFile(process.cwd() +"/view/createaccount/create.pug" , {error: true}))
            })
        }
    }
    else
    {
       return res.send(pug.renderFile(process.cwd() +"/view/createaccount/create.pug" , {fullfilAll: true}))
    }
})

//*****************************************End create account section************************* */
//******************************************Login section****************************** */

app.route("/login")
.get(function(req , res)
{
    if(req.session.connected)
    {
        res.redirect("/todos");
    }
    else
    {
        return res.send(pug.renderFile(process.cwd() +"/view/login/login.pug"))
    }
})
.post(function (req , res) 
{
    if(req.body.username && req.body.password)
    {
        utilFunction.compareLoginAndPassword(req.body.username , req.body.password).then((user)=>
        {
             req.session.connected = true;
             req.session.userId = user.id;
             req.session.teamId = user.teamId
             res.redirect("/todos")
        }).catch((e)=>
        {
           return res.send(pug.renderFile(process.cwd() +"/view/login/login.pug",{errorLogin:true}))
        })
    
    }
    else
    {
       return res.send(pug.renderFile(process.cwd() +"/view/login/login.pug",{errorLogin:true}))
    }
});


app.post("/apikey", (req,res)=>
{
    if(req.body.username && req.body.password)
    {
        utilFunction.compareLoginAndPassword(req.body.username , req.body.password).then((user)=>
        {
            if(user != null)
            {
                delete user.password
                res.status(200).send(user)
            }
        }).catch(()=>
        {
             return res.status(400).send("Username or password incorrect")
        })
    }
})
app.get("/disconnect",(req,res)=>
{
    req.session.destroy()
    return res.send(pug.renderFile(process.cwd() +"/view/login/login.pug"))
})
//******************************************End login section ************************/


// This function return one todo 
app.get("/todos/:todoid", (req,res)=>
{
    todo.findOne({where:{ id:req.params.todoid, [op.or]:{userId:req.session.userId , teamId: req.session.teamId}}}).then((myTodo)=>
    {
        if(myTodo != null)
        {  
            if(req.accepts("json","html") ==="json")
            {
                return res.status(200).send(myTodo.toJSON())
            }
            return res.status(200).send(pug.renderFile(process.cwd()+"/view/home/index.pug", {todos: myTodo})) 
        }
        else
        {
            req.session.msg = "Aucun todo vous appartenant trouver"
            return res.redirect("/todos")
        }
    })
    
});

// return all the todo of the user
// Important: if the query contain team (like http://www.url.com/todos?team=true) then it will display only the todos of his team and not his personnal
app.get("/todos" , (req,res) =>
{
    let obj = null
    let team = false
    if(req.query.team)
    {
       obj = {teamId: req.session.teamId}
       team = true
    }
    else
    {
       obj = {userId: req.session.userId } 
    }
    let msgCreated = null

    if(req.session.msg)
    {
        msgCreated = req.session.msg
        req.session.msg = null
    }
    todo.findAll({where:obj ,raw:true,
        include: [{
            model: user,
            
           }]
        }).then((myTodo)=>
    {
        if(myTodo != null)
        {  
            console.log("ook")
            if(req.accepts("json","html") === "json")
            {
                console.log("oook")
                return res.status(200).send(JSON.parse(JSON.stringify(myTodo)))
            }
            else
            {
                return res.status(200).send(pug.renderFile(process.cwd()+"/view/home/index.pug", {listTodos: myTodo , msg : msgCreated, userId : req.session.userId , team:team})) 
            }
        }
        else
        {
            if(req.accepts("json","html") === "json")
            {
               return res.status(400).send("No todo Found")
            }
            else
            {
               return res.status(200).send(pug.renderFile(process.cwd()+"/view/home/index.pug", {noTodoFound:true})) 
            }
        }
    }).catch((e)=>{console.log("error"+e)})
});



/*
* This middleware is super important
* We check is the user is logged , or if the apikey on the url is good
* We save the data of the user on his session
* TODO : add function to refresh the user settings sometimes
*/
function checkUser(req, res, next) {
    
    let key = false
    if(req.body.key)
    {
        key = req.body.key
    }
    else if(req.query.key)
    {
        key = req.query.key
    }
    
    if ( req.path == '/login' || req.path == '/createAccount')
    {
        if(req.session.connected)
        {
            return res.send(pug.renderFile(process.cwd() +"/view/home/index.pug"))
        }
        else
        {
            return next()
        }
    } 
    else if(req.path == '/apiKey')
    {
        return next()
    }
    else if(req.session.connected)
    {
        return next()
    }
    else
    {
        if(key != null)
        {
            user.findOne({where: {apiKey: key}}).then((user)=>
            {
                
                if(user != null)
                {
                    console.log("ok")
                    req.session.userId = user.id
                    req.session.teamId = user.teamId
                    return next()
                }
                else
                {
                    return res.status(401).send("Incorrect or missing api key2")
                }
            })
            .catch(()=>
            {
                return res.status(200).send("probel while processing your request")
            })
        }
        
        else if(req.accepts("json" , "html") === "json")
        {
            
           return res.status(401).send("Incorrect or missing api key")
        }
        else
        {
            return res.send(pug.renderFile(process.cwd() +"/view/login/login.pug"))
        }
       
    }
   
  }

  app.use((req,res)=>
{
    return res.send("404²")
})
  