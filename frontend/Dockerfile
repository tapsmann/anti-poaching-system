FROM node:18-bullseye-slim

# Set environment variables
ENV NODE_ENV=production

# Install time sync tools and clean up
RUN apt-get update && apt-get install -y \
    ntpdate \
    && ntpdate pool.ntp.org || true \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start"]