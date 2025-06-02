# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source code
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the app
CMD ["node", "server.js"]
