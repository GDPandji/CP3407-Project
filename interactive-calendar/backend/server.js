require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ **Connect to MySQL Database**
const db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taskmanager',
    port: process.env.DB_PORT || 3306
});

// ✅ **Check MySQL Connection**
db.connect(err => {
    if (err) {
        console.error('❌ MySQL Connection Failed:', err);
        process.exit(1); // Exit if DB connection fails
    }
    console.log('✅ Connected to MySQL Database');
});

// ✅ **API Routes**
app.get('/', (req, res) => {
    res.send('Task Manager API is running...');
});

// **Get All Tasks**
app.get('/tasks', (req, res) => {
    db.query('SELECT * FROM tasks', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// **Add a New Task**
app.post('/tasks', (req, res) => {
    const { title, date } = req.body;
    if (!title || !date) return res.status(400).json({ error: "Title and date are required" });

    db.query('INSERT INTO tasks (title, date) VALUES (?, ?)', [title, date], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Task added successfully', taskId: result.insertId });
    });
});

// **Delete a Task**
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    db.query('DELETE FROM tasks WHERE id = ?', [taskId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Task deleted successfully' });
    });
});

// ✅ **Start Server**
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

