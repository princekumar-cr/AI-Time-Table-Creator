const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// High-Fidelity Mock Database
let db = {
    users: [
        { id: 1, name: 'Admin', email: 'admin@college.edu', password: 'password', role: 'Admin' },
        { id: 2, name: 'Prince Singh', email: 'admin@aitimetablecreator.in', password: 'Prince@123', role: 'Admin' }
    ],
    teachers: [
        { id: 'T1', name: 'Dr. Upasana Rana', dept: 'CSE', designation: 'Asst. Professor', spec: 'Networks' },
        { id: 'T2', name: 'Prof. Deepak Pathak', dept: 'IT', designation: 'Associate Professor', spec: 'OS' }
    ],
    subjects: [
        { id: 'S1', code: 'CS101', name: 'Computer Networks', type: 'Theory' },
        { id: 'S2', code: 'IT202', name: 'Operating Systems', type: 'Theory' }
    ],
    rooms: [
        { id: 'R1', name: 'Room 101', type: 'Classroom', capacity: 60 },
        { id: 'L1', name: 'Lab A', type: 'Lab', capacity: 30 }
    ],
    timetable: [] 
};

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// --- AUTH API ---
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    if (db.users.find(u => u.email === email)) return res.status(400).json({ success: false, message: "Email already exists" });
    db.users.push({ id: Date.now(), name, email, password, role: 'User' });
    res.json({ success: true, message: "Account created successfully!" });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) res.json({ success: true, user });
    else res.status(401).json({ success: false, message: "Invalid credentials" });
});

// --- DATA API ---
app.get('/api/data', (req, res) => res.json(db));

// --- CRUD APIs ---
app.post('/api/teachers', (req, res) => {
    const teacher = { ...req.body, id: 'T' + Date.now() };
    db.teachers.push(teacher);
    res.json({ success: true, teacher });
});

app.post('/api/subjects', (req, res) => {
    const subject = { ...req.body, id: 'S' + Date.now() };
    db.subjects.push(subject);
    res.json({ success: true, subject });
});

app.post('/api/rooms', (req, res) => {
    const room = { ...req.body, id: 'R' + Date.now() };
    db.rooms.push(room);
    res.json({ success: true, room });
});

app.post('/api/chat', (req, res) => {
    res.json({ success: true, message: "AI Assistant: System optimized. Administrative access granted to Prince Singh." });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));

app.listen(PORT, () => console.log(`Server live at http://localhost:${PORT}`));
