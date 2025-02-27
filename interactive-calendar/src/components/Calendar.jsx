import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import "./calendar.css"; // Import external CSS file

export default function DayPlanner() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState("");

  const prevMonth = () => {
    setCurrentMonth(addDays(currentMonth, -30));
  };

  const nextMonth = () => {
    setCurrentMonth(addDays(currentMonth, 30));
  };

  const generateCalendar = () => {
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
  };

  const addTask = () => {
    if (newTask.trim() === "") return;
    setTasks({
      ...tasks,
      [format(selectedDate, "yyyy-MM-dd")]: [
        ...(tasks[format(selectedDate, "yyyy-MM-dd")] || []),
        newTask,
      ],
    });
    setNewTask("");
  };

  const removeTask = (taskIndex) => {
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const updatedTasks = (tasks[dateKey] || []).filter((_, index) => index !== taskIndex);
    setTasks({
      ...tasks,
      [dateKey]: updatedTasks,
    });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button"><ChevronLeft /></button>
        <h2>{format(currentMonth, "MMMM yyyy")}</h2>
        <button onClick={nextMonth} className="nav-button"><ChevronRight /></button>
      </div>
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        {generateCalendar().map((day, index) => (
          <button
            key={index}
            onClick={() => setSelectedDate(day)}
            className={`calendar-day ${
              isSameDay(day, selectedDate) ? "selected" : isSameMonth(day, currentMonth) ? "current-month" : "other-month"
            }`}
          >
            {format(day, "d")}
          </button>
        ))}
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
        <button onClick={addTask} className="add-task-button">Add Task</button>
        <div className="task-list">
          <h4>Tasks:</h4>
          <ul>
            {(tasks[format(selectedDate, "yyyy-MM-dd")] || []).map((task, index) => (
              <li key={index} className="task-item">
                {task}
                <button className="delete-task-button" onClick={() => removeTask(index)}>
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
