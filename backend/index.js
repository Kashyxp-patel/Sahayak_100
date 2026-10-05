require('dotenv').config(); // Need this to read the .env file!
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { Expo } = require('expo-server-sdk');
const expo = new Expo();
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

async function sendPushNotification(pushToken, title, body, data = {}) {
    if (!Expo.isExpoPushToken(pushToken)) return;
    try {
        await expo.sendPushNotificationsAsync([{
            to: pushToken,
            sound: 'default',
            title,
            body,
            data
        }]);
    } catch (error) {
        console.error("Push Notification Error:", error);
    }
}

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

        // 3. Send Push Notifications to Volunteers
        const volunteers = await prisma.volunteer.findMany({
            where: { expo_push_token: { not: null } }
        });
        
        for (const vol of volunteers) {
            await sendPushNotification(
                vol.expo_push_token,
                "New Task Available! 🚨",
                `A new ${category} request was just posted in your area.`
            );
        }

        res.status(201).json({ success: true, data: newTask, message: 'Saved to Supabase with Cloud Audio!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', details: error.message }});
    }
});

// API-02: Volunteers Fetch Pending Tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tagsParam = req.query.tags;
        let whereClause = { status: 'PENDING' };

        // If the volunteer app passes specific tags (e.g. ?tags=medical,travel,essential)
        // Only return tasks that match those categories.
        if (tagsParam) {
            const allowedCategories = tagsParam.split(',');
            whereClause.category = { in: allowedCategories };
        }

        const pendingTasks = await prisma.task.findMany({
            where: whereClause,
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
            },
            include: { senior: true, volunteer: true }
        });

        // Send Push Notification to the Senior
        if (updatedTask.senior && updatedTask.senior.expo_push_token) {
            await sendPushNotification(
                updatedTask.senior.expo_push_token,
                "Help is on the way! 🏃",
                `${updatedTask.volunteer.full_name} has accepted your request.`
            );
        }

        res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR' }});
    }
});

// API-04: Senior Fetch Task History
app.get('/api/tasks/senior/:seniorId', async (req, res) => {
    try {
        const history = await prisma.task.findMany({
            where: { senior_id: req.params.seniorId },
            include: { volunteer: true },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR' }});
    }
});

// API-05: Volunteer Fetch Task History (Active & Completed)
app.get('/api/tasks/volunteer/:volunteerId', async (req, res) => {
    try {
        const history = await prisma.task.findMany({
            where: { volunteer_id: req.params.volunteerId },
            include: { senior: true },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR' }});
    }
});

// API-06: Complete a Task
app.patch('/api/tasks/:id/complete', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedTask = await prisma.task.update({
            where: { id },
            data: { status: 'COMPLETED' }
        });
        res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR' }});
    }
});

// ==========================================
// ADMIN / POLICE API ENDPOINTS
// ==========================================

// API-07: Get Unverified Volunteers
app.get('/api/admin/volunteers/pending', async (req, res) => {
    try {
        const pending = await prisma.volunteer.findMany({
            where: { is_verified: false },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json({ success: true, data: pending });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR' }});
    }
});

// API-08: Verify Volunteer
app.patch('/api/admin/volunteers/:id/verify', async (req, res) => {
    const { id } = req.params;
    try {
        const verified = await prisma.volunteer.update({
            where: { id },
            data: { is_verified: true }
        });
        res.status(200).json({ success: true, data: verified });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR' }});
    }
});

// API-09: Save Senior Push Token
app.post('/api/users/senior/:id/push-token', async (req, res) => {
    try {
        const { token } = req.body;
        await prisma.senior.update({
            where: { id: req.params.id },
            data: { expo_push_token: token }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR' }});
    }
});

// API-10: Save Volunteer Push Token
app.post('/api/users/volunteer/:id/push-token', async (req, res) => {
    try {
        const { token } = req.body;
        await prisma.volunteer.update({
            where: { id: req.params.id },
            data: { expo_push_token: token }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR' }});
    }
});

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
