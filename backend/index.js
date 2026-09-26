require('dotenv').config(); // Need this to read the .env file!
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Databases
const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.use(cors());
app.use(express.json());

// Setup Multer to store incoming audio in memory (RAM) instead of local disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ==========================================
// SUPABASE API ENDPOINTS (Phase 2)
// ==========================================

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', message: 'Shirva Backend (Live DB + Cloud Storage) is running!' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Database disconnected' });
    }
});

// API-01: Senior Uploads a Request (Audio goes to Supabase Storage, Data goes to Postgres)
app.post('/api/tasks/upload', upload.single('audio'), async (req, res) => {
    let { category, textMessage, seniorId } = req.body;
    const hasAudio = !!req.file;

    if (Array.isArray(textMessage)) textMessage = textMessage[0];

    const hasText = typeof textMessage === 'string' && textMessage.trim() !== '';
    if (!hasAudio && !hasText) {
        return res.status(400).json({ success: false, error: { code: 'MISSING_REQUIRED_FIELDS' }});
    }

    let cloudAudioUrl = null;

    try {
        // 1. Upload audio to Supabase Storage (if present)
        if (hasAudio) {
            const fileName = `voice-note-${Date.now()}.m4a`;
            const { data, error } = await supabase.storage
                .from('audio-tasks')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype || 'audio/m4a',
                    upsert: false
                });

            if (error) throw new Error(`Storage upload failed: ${error.message}`);
            
            // Get public URL
            const { data: publicUrlData } = supabase.storage.from('audio-tasks').getPublicUrl(fileName);
            cloudAudioUrl = publicUrlData.publicUrl;
        }

        // 2. Save the task record to PostgreSQL via Prisma
        const newTask = await prisma.task.create({
            data: {
                senior_id: seniorId || "temp_senior_id",
                category: category || 'general',
                audio_url: cloudAudioUrl, // Save the cloud link!
                text_msg: textMessage || null,
                status: 'PENDING'
            }
        });

        res.status(201).json({ success: true, data: newTask, message: 'Saved to Supabase with Cloud Audio!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', details: error.message }});
    }
});

// API-02: Volunteers Fetch Pending Tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const pendingTasks = await prisma.task.findMany({
            where: { status: 'PENDING' },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json({ success: true, count: pendingTasks.length, data: pendingTasks });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR' }});
    }
});

// API-03: Volunteer Accepts a Task
app.patch('/api/tasks/:id/accept', async (req, res) => {
    const { id } = req.params;
    const { volunteerId } = req.body;

    if (!volunteerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' }});

    try {
        const task = await prisma.task.findUnique({ where: { id } });
        
        if (!task) return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND' }});
        if (task.status !== 'PENDING') return res.status(409).json({ success: false, error: { code: 'TASK_ALREADY_ACCEPTED' }});

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                status: 'ACCEPTED',
                volunteer_id: volunteerId
            }
        });

        res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR' }});
    }
});

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
