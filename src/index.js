const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find(user => user.username === username);
  if(!user){
    return response.status(404).send({error: "User not found!"});
  };
  request.user = user;
  return next();
};

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const checksExistsUserAccount = users.some(user => user.username === username);
  if(checksExistsUserAccount){
    return response.status(400).send({error: "Username Allready exists!"});
  };
  const user = {
    id: uuidv4(),
    name, 
    username, 
    todos: []
  };
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;
  const todo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {title, deadline} = request.body;
  const {user} = request;
  const findTodo = user.todos.find(todo => todo.id === id);
  if(!findTodo){
    return response.status(404).json({error: "Todo doesn't exists!"});
  };
  findTodo.title = title;
  findTodo.deadline = new Date(deadline);
  return response.json(findTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;
  const changeDone = user.todos.find(todo => todo.id === id);
  if(!changeDone){
    return response.status(404).json({error: "todo is not found!"});
  };
  changeDone.done = true;
  return response.json(changeDone);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;
  const indexDeleteTodo = user.todos.findIndex(todo => todo.id === id);
  if(indexDeleteTodo === -1){
    return response.status(404).json({error: "Todo is not found!"});
  }
  user.todos.splice(indexDeleteTodo, 1);
  return response.status(204).json();
});

module.exports = app;