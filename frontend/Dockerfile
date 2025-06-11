# Use Node.js to build the React app
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Copy .env file for build-time env vars
COPY .env .env

# Build the React app for production
RUN npm run build

# Use Nginx to serve the static build
FROM nginx:alpine

# Copy the build output to Nginx's html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 3000
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
