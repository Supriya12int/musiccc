FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create upload directory
RUN mkdir -p public/audio

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]