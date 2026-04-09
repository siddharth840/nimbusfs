# NimbusFS: Design & Architecture Document

## 1. Introduction
NimbusFS is a distributed file system (DFS) designed to provide reliable, scalable, and concurrent file access over a network. It implements a **Master-Slave (Gateway-Node)** architecture to decouple metadata management from physical data storage.

## 2. System Architecture

The system consists of three primary layers:

### 2.1 API Gateway (The Master)
The Gateway is the entry point for all client requests. It manages:
- **User Authentication**: Role-based access control (RBAC).
- **Metadata Management**: Tracking file locations, sizes, and owners.
- **Concurrency Control**: Managing file locks and lease expiry.
- **Node Health Monitoring**: Tracking the status of storage nodes.

### 2.2 Storage Nodes (The Slaves)
Independent processes that store physical file blocks.
- **Isolation**: Each node has a dedicated directory.
- **RESTful Interface**: Nodes communicate via a simple HTTP API for upload, download, and delete operations.

### 2.3 Client Dashboard
A React-based web interface that provides a transparent view of the distributed system, including real-time node health and activity logs.

---

## 3. Communication Protocol

NimbusFS uses a custom application-layer protocol built on top of **HTTP/TCP**.

### 3.1 Metadata Protocol (Gateway ↔ Database)
- Uses SQLAlchemy ORM to interact with an SQLite indexing database.
- Consistency is maintained via transactional updates to file metadata.

### 3.2 Data Transfer Protocol (Gateway ↔ Storage Nodes)
- **Upload**: Multipart/form-data POST requests.
- **Download**: Streaming response (chunked transfer encoding).
- **Delete**: Idempotent DELETE requests.

### 3.3 Real-time Status (Gateway ↔ Frontend)
- **WebSockets (WS)**: Pushes system-wide events (e.g., `FILE_LOCKED`, `NODE_OFFLINE`) to all connected clients instantly.

---

## 4. Key Mechanisms

### 4.1 Data Replication & Fault Tolerance
To prevent data loss, every file is replicated across multiple storage nodes.
- **Replication Factor**: Defaults to 3 (or all active nodes).
- **Failover Logic**: During a download, the Gateway attempts to retrieve data from each recorded node location sequentially. If Node A is offline, it transparently switches to Node B.

### 4.2 Concurrency Control (File Locking)
NimbusFS implements **Pessimistic Locking**:
- When a user locks a file, the `locked` flag in the metadata is set to `true`.
- **Lease Expiry**: Locks can have an optional `unlock_at` timestamp. A background worker periodically releases expired locks to prevent deadlocks from orphaned sessions.

### 4.3 2FA for Administrative Deletes
A unique safety feature where permanent file deletion requires acknowledgment from at least 2 active storage nodes, preventing accidental data loss due to a single corrupted node or mistaken request.

---

## 5. Metadata Schema (SQLite)

| Table | Purpose | Key Fields |
| :--- | :--- | :--- |
| `files` | Primary metadata | `filename`, `size`, `node_locations`, `locked`, `unlock_at` |
| `users` | Auth storage | `username`, `password_hash`, `role` |
| `activity_logs` | Audit trail | `action`, `timestamp`, `user` |
| `shared_links` | Public access | `token`, `expires_at`, `current_downloads` |
