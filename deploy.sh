#!/bin/bash
set -e

echo "🚌 TheMinaker Deployment Script"
echo "================================="

echo "[1/4] Pulling latest code from GitHub..."
git pull origin master

echo "[2/4] Ensuring .env.prod exists..."
if [ ! -f .env.prod ]; then
    echo "❌ ERROR: .env.prod not found! Please create it based on .env.prod.example"
    exit 1
fi

echo "[3/4] Rebuilding and restarting Docker containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "[4/4] Cleaning up unused Docker images..."
docker image prune -f

echo "================================="
echo "✅ Deployment successful! Caddy will automatically handle SSL."
