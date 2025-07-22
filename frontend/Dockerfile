FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Copy source code to get the latest package.json with all dependencies
COPY . .

# Install dependencies (this will install @supabase/ssr and other new packages)
RUN npm ci

# Create necessary directories with proper permissions
RUN mkdir -p .next node_modules/.cache && \
    chown -R node:node /app

# Switch to node user
USER node

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the development server
CMD ["npm", "run", "dev"] 