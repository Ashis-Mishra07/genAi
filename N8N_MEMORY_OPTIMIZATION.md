# N8N Memory Optimization Guide

## Problem

Your n8n service on Render is exceeding 512MB memory limit despite having only one workflow.

## Root Causes

1. **Large image processing**: Instagram images being downloaded and buffered in memory
2. **Facebook Graph API timeouts**: Long-running requests holding memory
3. **Workflow execution overhead**: N8N keeping execution data in memory

## Solutions Implemented

### 1. API Route Optimizations (`/api/instagram/post-via-n8n/route.ts`)

- ✅ Added request timeout (15 seconds)
- ✅ Added response cleanup
- ✅ Better error handling with memory cleanup
- ✅ Optimized headers

### 2. Instagram Poster Optimizations (`lib/instagram-poster.ts`)

- ✅ Reduced timeouts from 30s to 15s
- ✅ Added content length limits (50MB)
- ✅ Caption length limit (2200 chars)
- ✅ Reduced wait time between operations

### 3. N8N Workflow Optimizations

- ✅ Created memory-optimized workflow
- ✅ Reduced wait times
- ✅ Simplified data flow
- ✅ Direct URL usage (no image downloads)

## Render Deployment Settings

### Environment Variables

```bash
NODE_OPTIONS=--max_old_space_size=400
MAX_CONTENT_LENGTH=50000000
AXIOS_TIMEOUT=15000
N8N_PAYLOAD_SIZE_MAX=50
N8N_EXECUTIONS_DATA_PRUNE=true
N8N_EXECUTIONS_DATA_MAX_AGE=24
```

### Dockerfile Optimizations (if using Docker)

```dockerfile
# Use Alpine Linux for smaller memory footprint
FROM node:18-alpine

# Set memory limits
ENV NODE_OPTIONS="--max_old_space_size=400"
ENV N8N_PAYLOAD_SIZE_MAX=50

# Install only production dependencies
RUN npm ci --only=production
```

## Memory Monitoring

### Check Memory Usage

```bash
# On Render, check logs for memory usage
node -e "console.log(process.memoryUsage())"
```

### Instagram Workflow Best Practices

1. **Use direct URLs**: Avoid downloading images to server
2. **Limit caption length**: Max 2200 characters
3. **Quick timeouts**: 15 seconds max per request
4. **Clean up responses**: Cancel streams after use

## Testing the Optimizations

1. Deploy the updated code to Render
2. Monitor memory usage in Render dashboard
3. Test the Instagram posting workflow
4. Check n8n execution logs for memory warnings

## Expected Results

- Memory usage should drop from 512MB+ to ~200-300MB
- Faster workflow execution
- More reliable Instagram posting
- Better error handling

## If Issues Persist

### Upgrade Render Plan

- Consider upgrading to 1GB memory plan if optimizations aren't enough
- Use Render's auto-scaling if available

### Alternative Solutions

- Use external image hosting (Cloudinary, S3)
- Implement queue system for batch processing
- Split workflow into smaller microservices

## Monitoring Commands

```bash
# Check current memory usage
free -h

# Monitor n8n process
ps aux | grep n8n

# Check disk space
df -h
```
