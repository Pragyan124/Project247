import express, { text } from "express"
import mongoose from "mongoose";
import cors from "cors"
import "dotenv/config";

const app = express();
const MONGO_URI=`mongodb+srv://borthakurpragyan15_db_user:${process.env.MONGO_PASSWORD}@database.yzhfipq.mongodb.net/?appName=database`
const fs = require('fs');
const path = '/vault/secrets/database';

// If Vault injected the file, read it and set it as an Environment Variable
if (fs.existsSync(path)) {
    const secretContent = fs.readFileSync(path, 'utf8');
    // Assuming the file looks like: export MONGO_PASSWORD="your_pass"
    const match = secretContent.match(/MONGO_PASSWORD="(.+)"/);
    if (match) {
        process.env.MONGO_PASSWORD = match[1];
        console.log("Vault secret loaded successfully.");
    }
}

app.use(cors());
app.use(express.json());

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("Database Connected"))
    .catch((err) => console.error(err));

const todoSchema = new mongoose.Schema({
    text : { type: String, required: true},
    completed: {type: Boolean, default: false},
});

const Todo = mongoose.model("Todo", todoSchema);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get('/api/todos', async(req, res) => {
    const todos = await Todo.find();
    res.json(todos);
})


app.post("/api/todos", async (req, res) => {
  const todo = new Todo({ text: req.body.text });
  await todo.save();
  res.status(201).json(todo);
});

app.put("/api/todos/:id", async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  todo.completed = !todo.completed;
  await todo.save();
  res.json(todo);
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
