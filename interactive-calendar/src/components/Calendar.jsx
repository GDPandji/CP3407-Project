import { useState, useEffect } from "react";
import Login from "./Login";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import "./calendar.css";

export default function DayPlanner() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState("");
  const [taskColor, setTaskColor] = useState("#007bff");
  const [taskCategory, setTaskCategory] = useState("General");

  useEffect(() => {
    if (isLoggedIn) fetchTasks();
  }, [selectedDate, isLoggedIn]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:5000/tasks");
      const data = await res.json();
      const formattedTasks = {};
      data.forEach(task => {
        const dateKey = format(new Date(task.date), "yyyy-MM-dd");
        if (!formattedTasks[dateKey]) formattedTasks[dateKey] = [];
        formattedTasks[dateKey].push({ id: task.id, title: task.title, color: task.color });
      });
      setTasks(formattedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const addTask = async () => {
    if (newTask.trim() === "") return;

    const dateKey = format(selectedDate, "yyyy-MM-dd");

    try {
      const res = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask, date: dateKey, color: taskColor, category: taskCategory }),
      });

      if (res.ok) {
        const newTaskObj = await res.json();
        setTasks(prevTasks => ({
          ...prevTasks,
          [dateKey]: [...(prevTasks[dateKey] || []), { id: newTaskObj.taskId, title: newTask, color: taskColor }],
        }));
        setNewTask(""); // Clear input
        setTaskColor("#007bff"); // Reset default color
      } else {
        console.error("Failed to add task");
      }
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const removeTask = async (taskId, dateKey) => {
    try {
      const res = await fetch(`http://localhost:5000/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(prevTasks => ({
          ...prevTasks,
          [dateKey]: prevTasks[dateKey].filter(task => task.id !== taskId),
        }));
      } else {
        console.error("Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="calendar-container">
      <button className="logout-button" onClick={() => { localStorage.removeItem("isLoggedIn"); setIsLoggedIn(false); }}>Logout</button>
      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(addDays(currentMonth, -30))} className="nav-button"><ChevronLeft /></button>
        <h2>{format(currentMonth, "MMMM yyyy")}</h2>
        <button onClick={() => setCurrentMonth(addDays(currentMonth, 30))} className="nav-button"><ChevronRight /></button>
      </div>
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        {(() => {
          const monthStart = startOfMonth(currentMonth);
          const monthEnd = endOfMonth(monthStart);
          const startDate = startOfWeek(monthStart);
          const endDate = endOfWeek(monthEnd);
          let day = startDate;
          const calendar = [];
          while (day <= endDate) {
            calendar.push(day);
            day = addDays(day, 1);
          }
          return calendar;
        })().map((day, index) => {
          const dateKey = format(day, "yyyy-MM-dd");
          return (
            <button
              key={index}
              onClick={() => setSelectedDate(day)}
              className={`calendar-day ${isSameDay(day, selectedDate) ? "selected" : isSameMonth(day, currentMonth) ? "current-month" : "other-month"}`}
            >
              <div className="date-number">{format(day, "d")}</div>
              <div className="task-preview">
                {(tasks[dateKey] || []).slice(0, 2).map(task => (
                  <div key={task.id} className="task-in-calendar" style={{ backgroundColor: task.color }}>
                    {task.title.length > 10 ? task.title.substring(0, 10) + "..." : task.title}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
      <div className="task-section">
        <h3>Selected Date</h3>
        <p>{format(selectedDate, "PPP")}</p>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="task-input"
          placeholder="Add a task"
        />
        <label>Task Category:</label>
        <select className="task-category" value={taskCategory} onChange={(e) => setTaskCategory(e.target.value)}>
          <option value="General">General</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Health">Health</option>
        </select>
        <label>Task Color:</label>
        <input type="color" value={taskColor} onChange={(e) => setTaskColor(e.target.value)} className="task-color-picker" />
        <button onClick={addTask} className="add-task-button">Add Task</button>
        <div className="task-list">
          <h4>Tasks:</h4>
          <ul>
            {(tasks[format(selectedDate, "yyyy-MM-dd")] || []).map(task => (
              <li key={task.id} className="task-item" style={{ backgroundColor: task.color }}>
                {task.title}
                <button className="delete-task-button" onClick={() => removeTask(task.id, format(selectedDate, "yyyy-MM-dd"))}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}