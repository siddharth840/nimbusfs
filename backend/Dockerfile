FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source
COPY . .

# Initialize Prisma
RUN npx prisma generate

# Final build
RUN npm run build

EXPOSE 8005 8001 8002 8003

CMD ["npm", "start"]
