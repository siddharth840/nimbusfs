export declare const NODES: Record<string, string>;
export declare function getNodeUrl(node: string, endpoint: string): string;
export declare function logActivity(action: string, filename: string, user?: string): Promise<{
    timestamp: Date;
    action: string;
    filename: string;
    user: string;
    id: number;
}>;
export declare function distributeFile(fileBuffer: Buffer, filename: string, size: number, owner?: string): Promise<{
    filename: string;
    id: number;
    size: number;
    owner: string;
    locked: boolean;
    uploadDate: Date;
    nodeLocations: string;
    isDeleted: boolean;
    unlockAt: Date | null;
}>;
export declare function deleteFile(filename: string, soft?: boolean): Promise<boolean>;
export declare function restoreFile(filename: string): Promise<boolean>;
//# sourceMappingURL=fileManager.d.ts.map