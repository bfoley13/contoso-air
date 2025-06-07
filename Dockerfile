# Use Node.js 22 LTS as the base image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY src/web/package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs && \
    adduser -S contoso -u 1001

# Copy the application source code
COPY src/web/ ./

# Change ownership of the app directory to the nodejs user
RUN chown -R contoso:nodejs /app

# Switch to the non-root user
USER contoso

# Expose the port the app runs on
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Define the command to run the application
CMD ["npm", "start"]
