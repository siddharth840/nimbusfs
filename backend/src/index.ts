import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import axios from 'axios';
import * as fileManager from './fileManager.js';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/clients' });

const SECRET_KEY = "nimbusfs_ultra_secret_key_change_in_production";
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// --- WebSocket Management ---
const activeConnections = new Set<WebSocket>();
wss.on('connection', (ws) => {
    activeConnections.add(ws);
    ws.on('close', () => activeConnections.delete(ws));
});

const broadcast = (message: string) => {
    activeConnections.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(message);
    });
};

// --- Middleware ---
const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, async (err: any, decoded: any) => {
        if (err) return res.sendStatus(403);
        const user = await prisma.user.findUnique({ where: { username: decoded.sub } });
        if (!user) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Auth Endpoints ---
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (password.length < 8) return res.status(400).json({ detail: "Password too short" });
    
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ detail: "Username taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { username, passwordHash, role: role || 'standard_user' }
    });

    res.json({ username: user.username, role: user.role });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body; // Note: In case of URLSearchParams use a different approach
    // For simplicity, we assume JSON for now as React usually sends JSON
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(400).json({ detail: "Incorrect username or password" });
    }

    const token = jwt.sign({ sub: user.username }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ access_token: token, token_type: "bearer", user: { name: user.username, role: user.role } });
});

// --- File Endpoints ---
app.get('/files', authenticateToken, async (req: any, res) => {
    const { search, deleted = 'false' } = req.query;
    const isDeleted = deleted === 'true';

    const where: any = { isDeleted };
    if (req.user.role !== 'administrator') where.owner = req.user.username;
    if (search) where.filename = { contains: search as string };

    const files = await prisma.fileMetadata.findMany({ 
        where,
        orderBy: { uploadDate: 'desc' }
    });
    res.json(files);
});

app.post('/upload', authenticateToken, upload.single('file'), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ detail: "No file provided" });
    try {
        const file = await fileManager.distributeFile(req.file.buffer, req.file.originalname, req.file.size, req.user.username);
        res.json(file);
    } catch (error) {
        res.status(500).json({ detail: (error as Error).message });
    }
});

app.get('/download/:filename', authenticateToken, async (req: any, res) => {
    const { filename } = req.params;
    const file = await prisma.fileMetadata.findFirst({ where: { filename } });

    if (!file) return res.status(404).json({ detail: "File not found" });
    if (req.user.role !== 'administrator' && file.owner !== req.user.username) {
        return res.status(403).json({ detail: "Access denied" });
    }

    const locations = file.nodeLocations.split(',');
    for (const node of locations) {
        try {
            const url = fileManager.getNodeUrl(node, `/download/${filename}`);
            const response = await axios.get(url, { responseType: 'stream', timeout: 10000 });
            
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            res.setHeader('Content-Type', 'application/octet-stream');
            
            response.data.pipe(res);
            // Wait for stream to finish before logging (optional but safer)
            response.data.on('end', async () => {
                await fileManager.logActivity("DOWNLOAD", filename, req.user.username);
            });
            return;
        } catch (error) {
            console.error(`Download failed from ${node}`);
        }
    }
    res.status(404).json({ detail: "Data missing on nodes" });
});

// --- Stats & Others ---
app.get('/stats', authenticateToken, async (req: any, res) => {
    const where: any = { isDeleted: false };
    if (req.user.role !== 'administrator') where.owner = req.user.username;

    const files = await prisma.fileMetadata.findMany({ where });
    res.json({
        total_files: files.length,
        storage_used: files.reduce((acc, f) => acc + f.size, 0),
        active_clients: activeConnections.size,
        locked_files: files.filter(f => f.locked).length
    });
});

app.get('/activity', authenticateToken, async (req: any, res) => {
    const where: any = {};
    if (req.user.role !== 'administrator') where.user = req.user.username;

    const logs = await prisma.activityLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 20
    });
    res.json(logs);
});

// --- Lock/Unlock ---
app.post('/lock/:filename', authenticateToken, async (req: any, res) => {
    const { filename } = req.params;
    const { duration_hours } = req.query;

    const file = await prisma.fileMetadata.findFirst({ where: { filename } });
    if (!file) return res.status(404).json({ detail: "File not found" });

    const unlockAt = duration_hours ? new Date(Date.now() + Number(duration_hours) * 3600000) : null;
    
    await prisma.fileMetadata.updateMany({
        where: { filename },
        data: { locked: true, unlockAt }
    });

    await fileManager.logActivity("LOCK", filename, req.user.username);
    res.json({ message: "Locked" });
});

app.post('/unlock/:filename', authenticateToken, async (req: any, res) => {
    const { filename } = req.params;
    await prisma.fileMetadata.updateMany({
        where: { filename },
        data: { locked: false, unlockAt: null }
    });
    await fileManager.logActivity("UNLOCK", filename, req.user.username);
    res.json({ message: "Unlocked" });
});

// --- Background Job (Auto-unlock) ---
setInterval(async () => {
    const now = new Date();
    const expired = await prisma.fileMetadata.findMany({
        where: { locked: true, unlockAt: { lte: now } }
    });

    for (const file of expired) {
        await prisma.fileMetadata.update({
            where: { id: file.id },
            data: { locked: false, unlockAt: null }
        });
        await fileManager.logActivity("AUTO_UNLOCK", file.filename);
    }
}, 60000);

const PORT = 8005;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`NimbusFS Node.js API running on port ${PORT}`);
});
