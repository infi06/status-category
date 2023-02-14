const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// declare
const hasPriorityAndStatusPropertiesAndCategoryAndDuedate = (requestQuery) => {
  return (
    requestQuery.priority !== undefined &&
    requestQuery.status !== undefined &&
    requestQuery.category !== undefined &&
    requestQuery.dueDate !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const hasDueDateProperty = (requestQuery) => {
  return requestQuery.due_date !== undefined;
};

//invalid scenario
const hasPriorityInvalid = (requestQuery) => {
  return requestQuery.priority !== "HIGH" || "LOW" || "MEDIUM";
};
const hasStatusInvalid = (requestQuery) => {
  return requestQuery.status !== "IN PROGRESS" || "TO DO" || "DONE";
};
const hasCategoryInvalid = (requestQuery) => {
  return requestQuery.category !== "WORK" || "LEARNING" || "HOME";
};

//API 1 Get

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category, due_date } = request.query;

  switch (true) {
    case hasPriorityAndStatusPropertiesAndCategoryAndDuedate(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}'
    AND category='${category}'
    AND dueDate= ${due_date};`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;

    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;

    case hasCategoryProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${category}';`;
      break;

    case hasDueDateProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND dueDate = '${due_date}';`;
      break;

    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(
    data.map((eachTodo) => ({
      id: eachTodo.id,
      todo: eachTodo.todo,
      priority: eachTodo.priority,
      status: eachTodo.status,
      category: eachTodo.category,
      dueDate: eachTodo.due_date,
    }))
  );
});

//getinvalid Api
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status, category, due_date } = request.query;

  switch (true) {
    case hasPriorityInvalid(request.query):
      response.status(400);
      response.send("Invalid Todo Priority");
      break;
    case hasStatusInvalid(request.query):
      response.status(400);
      response.send("Invalid Todo Status");

      break;
    case hasCategoryInvalid(request.query):
      response.status(400);
      response.send("Invalid Todo Category");

      break;
    case hasDueDateInvalid(request.query):
      response.status(400);
      response.send("Invalid Todo Due Date");

      break;
  }
});

//get state API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getStateQuery = `
    SELECT *
    FROM todo
     WHERE id=${todoId};`;
  const todoList = await db.get(getStateQuery);
  response.send({
    id: todoList.id,
    todo: todoList.todo,
    priority: todoList.priority,
    status: todoList.status,
    category: todoList.category,
    dueDate: todoList.due_date,
  });
});

// agenda
app.get("/agenda/", async (request, response) => {
  const date = format(new Date(2021, 1, 21), "yyyy-MM-dd");
  const result = await datebase.get(getQuery);
  response.send(result);
});

//post

app.post("/todos/", async (request, response) => {
  const districtDetails = request.body;
  const { id, todo, priority, status } = districtDetails;
  const addDistrictQuery = `INSERT INTO 
     todo(id, todo, priority, status, due_date)
  VALUES (
      ${id}, '${todo}', '${priority}', '${status}', ${dueDate}
    );`;
  const dbResponse = await db.run(addDistrictQuery);
  console.log(dbResponse);
  response.send("Todo Successfully Added");
});

//delete player API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteDistrictQuery = `
    DELETE FROM todo
    WHERE 
      id = ${todoId};`;
  const districtDEl = await db.run(deleteDistrictQuery);
  response.send("Todo Deleted");
});

//put

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateDistrictQuery = `
    UPDATE todo
    SET 
     
     todo='${todo}',
     priority='${priority}',
     status='${status}'
     
     
    WHERE 
      id = ${todoId};`;
  const districtInform = await db.run(updateDistrictQuery);
  response.send(`${updateColumn} Updated`);
});

module.exports = app;
