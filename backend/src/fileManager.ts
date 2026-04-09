import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const NODES: Record<string, string> = {
    "node1": process.env.NODE1_URL || "http://localhost:8001",
    "node2": process.env.NODE2_URL || "http://localhost:8002",
    "node3": process.env.NODE3_URL || "http://localhost:8003"
};

export function getNodeUrl(node: string, endpoint: string) {
    const baseUrl = NODES[node];
    return `${baseUrl}/${endpoint.replace(/^\//, '')}`;
}

export async function logActivity(action: string, filename: string, user: string = "Admin") {
    return await prisma.activityLog.create({
        data: { action, filename, user }
    });
}

export async function distributeFile(fileBuffer: Buffer, filename: string, size: number, owner: string = "Admin") {
    const nodeLocations: string[] = [];
    
    // Attempt to upload to each node
    for (const [node, baseUrl] of Object.entries(NODES)) {
        try {
            const formData = new FormData();
            const blob = new Blob([new Uint8Array(fileBuffer)]);
            formData.append('file', blob, filename);

            const response = await axios.post(`${baseUrl}/upload/${filename}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000
            });

            if (response.status === 200) {
                nodeLocations.push(node);
            }
        } catch (error) {
            console.error(`Failed to upload to ${node}:`, (error as Error).message);
        }
    }

    if (nodeLocations.length === 0) {
        throw new Error("Failed to upload file to any node");
    }

    // Save metadata
    const dbFile = await prisma.fileMetadata.create({
        data: {
            filename,
            size,
            owner,
            nodeLocations: nodeLocations.join(',')
        }
    });

    await logActivity("UPLOAD", filename, owner);
    return dbFile;
}

export async function deleteFile(filename: string, soft: boolean = true) {
    const dbFiles = await prisma.fileMetadata.findMany({
        where: { filename, isDeleted: !soft ? true : false }
    });

    if (dbFiles.length === 0) return false;
    if (dbFiles.some(f => f.locked)) return false;

    if (soft) {
        await prisma.fileMetadata.updateMany({
            where: { filename, isDeleted: false },
            data: { isDeleted: true }
        });
        await logActivity("SOFT_DELETE", filename);
        return true;
    }

    // Permanent delete from nodes
    let successCount = 0;
    for (const [node, baseUrl] of Object.entries(NODES)) {
        try {
            const response = await axios.delete(`${baseUrl}/delete/${filename}`, { timeout: 10000 });
            if (response.status === 200) successCount++;
        } catch (error) {
            console.error(`Failed to delete from ${node}`);
        }
    }

    // 2FA check
    const twoFactorSetting = await prisma.setting.findUnique({ where: { key: "two_factor_auth" } });
    const twoFactorEnabled = twoFactorSetting?.value === "true";

    if (twoFactorEnabled && successCount < 2) {
        throw new Error("Multi-node confirmation failed");
    }

    await prisma.fileMetadata.deleteMany({ where: { filename, isDeleted: true } });
    await logActivity("PERMANENT_DELETE", filename);
    return true;
}

export async function restoreFile(filename: string) {
    const result = await prisma.fileMetadata.updateMany({
        where: { filename, isDeleted: true },
        data: { isDeleted: false }
    });
    
    if (result.count > 0) {
        await logActivity("RESTORE", filename);
        return true;
    }
    return false;
}
