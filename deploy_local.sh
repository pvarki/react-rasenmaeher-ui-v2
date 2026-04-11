#!/usr/bin/env bash
set -e

# Configuration
PRODUCTS=${1:-"all"}
VITE_THEME=${2:-"default"}

echo "Starting local build and deploy..."

# 1. Ensure Vercel CLI is available
# Check for local path or global command
if [ -f "./node_modules/.bin/vercel" ]; then
    echo "Found local Vercel CLI"
    export PATH="$PATH:$(pwd)/node_modules/.bin"
elif ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found, installing locally in uiv2..."
    pnpm add -D vercel
    export PATH="$PATH:$(pwd)/node_modules/.bin"
fi

# 2. Build product integrations and the main UI
echo "Building project..."
pnpm install
pnpm mock:build

# 3. Deploy to Vercel
echo "Deploying to Vercel..."

# Construct the .vercel/output structure that --prebuilt expects
echo "Preparing .vercel/output..."
rm -rf .vercel/output
mkdir -p .vercel/output/static
cp -r dist/* .vercel/output/static/

# Generate config.json with SPA rewrite rule (all paths -> index.html)
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    { "src": "/assets/(.*)", "dest": "/assets/$1" },
    { "src": "/(.*\\..*)", "dest": "/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOF

# Deploy using the prebuilt structure
vercel deploy --prebuilt --prod

echo "Deployment complete!"
