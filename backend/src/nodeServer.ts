import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const NODE_NAME = process.env.NODE_NAME || "node1";
const STORAGE_DIR = path.join("storage", NODE_NAME);

if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Multer disk storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, STORAGE_DIR),
    filename: (req, file, cb) => cb(null, req.params.filename || file.originalname)
});
const upload = multer({ storage: storage });

app.get('/health', (req, res) => {
    res.json({ status: "ok", node: NODE_NAME });
});

app.post('/upload/:filename', upload.single('file'), (req, res) => {
    res.json({ message: "File uploaded successfully" });
});

app.get('/download/:filename', (req, res) => {
    const filepath = path.join(STORAGE_DIR, req.params.filename);
    if (fs.existsSync(filepath)) {
        res.download(filepath);
    } else {
        res.status(404).json({ detail: "File not found on this node" });
    }
});

app.delete('/delete/:filename', (req, res) => {
    const filepath = path.join(STORAGE_DIR, req.params.filename);
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        res.json({ message: "File deleted successfully" });
    } else {
        res.json({ message: "File not found or already deleted" });
    }
});

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] && __filename.includes(path.basename(process.argv[1]))) {
    const port = parseInt(process.argv[2] as string) || 8001;
    const nodeName = (process.argv[3] as string) || "node1";
    
    app.listen(port, "0.0.0.0", () => {
        console.log(`Node Server ${nodeName} running on port ${port}`);
    });
}

export default app;
