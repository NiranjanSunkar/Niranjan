const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const databasePath = path.join(__dirname, 'todoApplication.db')
const app = express()
app.use(express.json())
let database = null
const initializerdbServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
initializerdbServer()

const haspriorityAndStatusProperities = requestQuery => {
  return (
    requestQuery.priority === undefined && requestQuery.status === undefined
  )
}
const hasprirority = requestQuery => {
  return requestQuery.priority === undefined
}
const hasStatusProperty = requestQuery => {
  return requestQuery.status === undefined
}
//API 1
app.get('/todos/', async (request, response) => {
  let data = nul
  let getTodoQuery = ''
  const {search_q = '', priority, status} = request.query
  switch (true) {
    case haspriorityAndStatusProperities(request.query):
      getTodoQuery = `
            SELECT * FROM todo
            WHERE 
            todo LIKE '%${search_q}%'
            AND status = '${status}'
            AND priority = '${priority};`
      break
    case hasPriorityProperty(request.query):
      getTodoQuery = `
            SELECT * FROM todo
            WHERE 
            todo LIKE '%${search_q}%'
            AND priority = ${priority};`
      break
    case hasStatusProperty(request.query):
      getTodoQuery = `
            SELECT * FROM todo 
            WHERE 
            todo LIKE '%${search_q}%'
            AND status = ${status};`
      break
    default:
      getTodoQuery = `
          SELECT * FROM todo
          WHERE 
          todo LIKE '%${search_q}%';`
  }
  data = await database.all(getTodoQuery)
  response.send(data)
})
//API 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoID} = request.params
  const getTodoQuery = `
    SELECT * FROM todo 
    WHERE id='${todoID};`
  const todo = await database.get(getTodoQuery)
  response.send(todo)
})
//API 3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const postQuery = `
    INSERT INTO todo
    VALUES(${id},${todo},${priority},${status});`
  await database.run(postQuery)
  response.send('Todo Successfully Added')
})
//API 4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoID} = request.params
  let updatedColumn = ''
  const requestbody = request.body
  switch (true) {
    case requestbody.status === undefined:
      updatedColumn = 'Status'
      break
    case requestbody.priority === undefined:
      updatedColumn = 'Priority'
      break
    case requestbody.todo === undefined:
      updatedColumn = 'Todo'
      break
  }
  const PreviousTodoQuery = `
  SELECT * FROM 
  todo 
  WHERE id = '${todoID}';`
  const previousTodo = await database.get(PreviousTodoQuery)
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body
  const updateTodoQuery = `
  UPDATE 
  todo 
  SET 
  todo=${todo},
  priority = ${priority},
  status = ${status}
  WHERE 
  id = ${todoID};`
  await database.run(updateTodoQuery)
  response.send(`${updatedColumn} updated`)
})
//API 5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoID} = request.params
  const deleteQuery = `
  DELETE FROM 
  todo 
  WHERE 
  id=${todoID};`
  await database.run(deleteQuery)
  response.send('Todo Deleted')
})
module.exports = app
