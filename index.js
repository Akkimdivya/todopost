const express = require("express");
const path = require("path");
const bp = require("body-parser");
const cors = require("cors");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

const dbPath = path.join(__dirname, "todolist.db");

let db = null;

const port = process.env.PORT || 3000;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//All todo's
app.get("/todos/", async (request, response) => {
    const getTodosQuery = `
      SELECT
        *
      FROM
        todo
      ORDER BY
        id;`;
    const todosArray = await db.all(getTodosQuery);
    response.send(todosArray);
  });

//selected todo
app.get("/todos/:todoId/", async (request, response) => {
    const { todoId } = request.params;
    const getTodoQuery = `
      SELECT
        *
      FROM
        todo
      WHERE
        id = ${todoId};`;
    const todo = await db.get(getTodoQuery);
    response.send(todo);
  });  

  app.post("/todos/", async (request, response) => {
    const todoDetails = request.body;
    const {
      todo,
      category,
      priority,
      status,
      dueDate,
    } = todoDetails;
    const addTodoQuery = `
      INSERT INTO
        todo (todo,category,priority,status,due_date)
      VALUES
        (
          '${todo}',
          '${category}',
          '${priority}',
          '${status}',
          '${dueDate}'
        );`;
  
    const dbResponse = await db.run(addTodoQuery);
    const todoId = dbResponse.lastID;
    response.send({ id: todoId });
  });  
