
FROM node:latest as build
WORKDIR /app

# Copy package.json and package-lock.json (if present) for dependency installation
COPY package*.json ./

# Install the dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port your app will run on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]