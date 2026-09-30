const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE (For 50% Milestone Showcase) ---
// This simulates PostgreSQL before we hook up Prisma
let tasksDB = [];

// Setup Multer for audio file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.m4a';
        cb(null, 'voice-note-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });


// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Shirva Backend v0.5 is running' });
});

// 2. API-01: Senior Uploads a Request
app.post('/api/tasks/upload', upload.single('audio'), (req, res) => {
    let { category, textMessage } = req.body;
    const hasAudio = !!req.file;

    // Fix: If Postman sends duplicate keys, Multer turns it into an array. Extract the first string.
    if (Array.isArray(textMessage)) textMessage = textMessage[0];

    // BR-03: Validation (Safe against undefined and arrays)
    const hasText = typeof textMessage === 'string' && textMessage.trim() !== '';
    if (!hasAudio && !hasText) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_REQUIRED_FIELDS', message: 'Must provide audio or text.' }
        });
    }

    // Create new Task record
    const newTask = {
        id: `task_${Date.now()}`, // Simulated UUID
        senior_id: 'senior_123',
        category: category || 'general',
        audio_url: hasAudio ? `/uploads/${req.file.filename}` : null,
        text_msg: textMessage || null,
        status: 'PENDING',
        volunteer_id: null,
        created_at: new Date().toISOString()
    };

    tasksDB.push(newTask); // Save to in-memory DB

    res.status(201).json({
        success: true,
        data: newTask,
        message: 'Push notifications dispatched to volunteers.'
    });
});

// 3. API-02: Volunteers Fetch Pending Tasks
app.get('/api/tasks', (req, res) => {
    // Only return PENDING tasks for the feed
    const pendingTasks = tasksDB.filter(task => task.status === 'PENDING');

    res.status(200).json({
        success: true,
        count: pendingTasks.length,
        data: pendingTasks
    });
});

// 4. API-03: Volunteer Accepts a Task
app.patch('/api/tasks/:id/accept', (req, res) => {
    const { id } = req.params;
    const { volunteerId } = req.body; // Simulated auth token decoding

    if (!volunteerId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing volunteerId' } });
    }

    const taskIndex = tasksDB.findIndex(t => t.id === id);

    // Check if task exists
    if (taskIndex === -1) {
        return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Task not found' } });
    }

    const task = tasksDB[taskIndex];

    // BR-02: Concurrency Lock / State Check
    if (task.status !== 'PENDING') {
        return res.status(409).json({
            success: false,
            error: { code: 'TASK_ALREADY_ACCEPTED', message: 'Another volunteer has already claimed this task.' }
        });
    }

    // Update Task
    task.status = 'ACCEPTED';
    task.volunteer_id = volunteerId;
    tasksDB[taskIndex] = task;

    res.status(200).json({
        success: true,
        data: task
    });
});

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
