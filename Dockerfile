<<<<<<< HEAD
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port (Render will set PORT environment variable)
EXPOSE $PORT

# Start the application
=======
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port (Render will set PORT environment variable)
EXPOSE $PORT

# Start the application
>>>>>>> ff6db2916f42106ebdfa88d8e8ce71566ff30a08
CMD ["npm", "start"]