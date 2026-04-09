# 🚀 Distributed File Storage System (DFS)

A **full-stack Distributed File Storage System** that simulates real-world cloud storage like Google Drive, Amazon S3, and HDFS.

This project demonstrates how files can be **split, distributed, replicated, and reconstructed** across multiple nodes with cloud storage integration.

---

## 📌 Features

* 📂 File Upload & Download
* ✂️ File Chunking (1MB chunks)
* 🌐 Distributed Storage (multiple nodes)
* 🔁 Replication (fault tolerance)
* ☁️ Firebase Storage integration
* 🗄️ MongoDB Atlas metadata management
* ⚡ Node health monitoring
* 🔐 Authentication (JWT-based) *(optional)*

---

## 🧠 System Architecture

* **Client (Frontend)** → Upload/Download files
* **Master Server** → Manages metadata & distribution
* **Storage Nodes** → Handle chunk storage
* **Firebase Storage** → Stores actual file chunks
* **MongoDB Atlas** → Stores file metadata

---

## 🏗️ Tech Stack

### 🔹 Frontend

* React (Vite)
* Tailwind CSS
* Axios

### 🔹 Backend

* Node.js + Express
* Multer (file upload)
* Firebase Admin SDK
* Mongoose (MongoDB)

### 🔹 Cloud Services

* Firebase Storage
* MongoDB Atlas
* Render (backend hosting)
* Vercel (frontend hosting)

---

## 📁 Project Structure

```bash
dfs-project/
│
├── frontend/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
```

---

## ⚙️ Installation & Setup

### 🔹 1. Clone the Repository

```bash
git clone https://github.com/your-username/dfs-project.git
cd dfs-project
```

---

### 🔹 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
FIREBASE_BUCKET=your-project.appspot.com
FIREBASE_KEY=your_firebase_json
NODES=https://node1.onrender.com,https://node2.onrender.com
ROLE=master
```

Run backend:

```bash
npm start
```

---

### 🔹 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Deployment

### 🔹 Backend

Deploy on **Render**:

* Create multiple services:

  * Master
  * Node1
  * Node2

### 🔹 Frontend

Deploy on **Vercel**

---

## 🔄 Workflow

### 📤 Upload Flow

1. File uploaded from frontend
2. Backend splits into chunks
3. Chunks distributed across nodes
4. Stored in Firebase
5. Metadata saved in MongoDB

---

### 📥 Download Flow

1. Fetch metadata
2. Retrieve chunks from Firebase
3. Merge chunks
4. Return final file

---

## 🧪 API Endpoints

| Method | Endpoint      | Description   |
| ------ | ------------- | ------------- |
| POST   | /upload       | Upload file   |
| GET    | /files        | Get all files |
| GET    | /download/:id | Download file |
| GET    | /health       | Node status   |

---

## 🛡️ Future Improvements

* Advanced load balancing
* File versioning
* Encryption (AES)
* Real-time monitoring dashboard
* Kubernetes deployment

---

## 🎓 Academic Relevance

This project demonstrates key concepts of:

* Distributed Systems
* Cloud Computing
* Fault Tolerance
* Data Replication
* Scalability

---

## 💀 Author

**Siddharth Kapoor**

---

## ⭐ Give a Star

If you found this project useful, consider giving it a ⭐ on GitHub!
