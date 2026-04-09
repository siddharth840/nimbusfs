# NimbusFS - Distributed File Storage

NimbusFS is a modern, distributed file storage system designed for scale, reliability, and speed. It automatically distributes files across multiple storage nodes using chunk-based distribution, ensuring high availability and redundancy.

![NimbusFS Dashboard](https://github.com/siddharth840/nimbusfs/raw/main/public/placeholder.svg)

## 🚀 Key Features

- **Automatic Chunking**: Large files are split into optimally-sized chunks for efficient storage and retrieval.
- **Multi-Node Distribution**: Chunks are distributed across multiple storage nodes to prevent data loss.
- **Data Redundancy**: Configurable replication factors to ensure 99.99% uptime.
- **Real-time Monitoring**: Intuitive dashboard to monitor node health, storage metrics, and file distribution.
- **Secure Access**: Integrated authentication and granular access controls.
- **API First**: Fully documented REST API for seamless integration with other services.

## 🛠️ Technology Stack

- **Frontend**: Next.js 15+, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Prisma with SQLite/PostgreSQL
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (for initial chunks) / Custom Node Logic

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Firebase Project (for Auth & Storage)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/siddharth840/nimbusfs.git
   cd nimbusfs
   ```

2. Install dependencies:
   ```bash
   # If using pnpm (recommended)
   pnpm install --no-frozen-lockfile
   # If using npm
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Fill in your Firebase and Database credentials
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📐 Architecture Overview

NimbusFS operates on a **Master-Node** architecture:

1. **Client**: Uploads files through the Web UI or API.
2. **Master (Next.js API)**: 
   - Receives the file.
   - Splits it into chunks.
   - Assigns chunks to different storage nodes.
   - Stores metadata in the Database.
3. **Storage Nodes**: Store the actual data chunks.
4. **Replication**: Background processes ensure that every chunk is replicated according to the system policy.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by [Siddharth Kapoor](https://github.com/siddharth840)
