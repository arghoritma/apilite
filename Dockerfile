# Dockerfile for apilite production
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy source code
COPY . .

# Set environment variables from .env file (optional, recommended to use docker-compose for env)
# ENV NODE_ENV=production

# Build if needed (uncomment if you have build step)
# RUN npm run build

# Expose port (default from .env)
EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"]
