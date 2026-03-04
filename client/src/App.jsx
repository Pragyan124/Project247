import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/todos";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  // Fetch todos on mount
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then(setTodos);
  }, []);

  // Add todo
  const addTodo = async () => {
    if (!text.trim()) return;
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
    setText("");
  };

  // Toggle todo
  const toggleTodo = async (id) => {
    const res = await fetch(`${API}/${id}`, { method: "PUT" });
    const updated = await res.json();
    setTodos(todos.map((t) => (t._id === id ? updated : t)));
  };

  // Delete todo
  const deleteTodo = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t._id !== id));
  };

  return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: 50,
      width: "340%",
      fontFamily: "sans-serif",
    }}
  >
    <div
      style={{
        width: 500,
        justifyContent: "center",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(198, 157, 157, 0.1)",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Todo App</h1>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a new todo..."
          style={{ flex: 1, padding: "8px 12px", fontSize: 16 , color: "white"}}
        />
        <button onClick={addTodo} style={{ padding: "8px 16px", fontSize: 16 }}>
          Add
        </button>
      </div>

      {/* Todo List */}
      <ul style={{ listStyle: "none", padding: 0}}>
        {todos.map((todo) => (
          <li
            key={todo._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo._id)}
            />
            <span
              style={{
                flex: 1,
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "#aaa" : "#fbdfdf",
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo._id)}
              style={{
                color: "red",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 28,
              }}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
}